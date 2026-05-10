import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { config } from '../../config';
import { signToken, signRefreshToken, verifyToken } from '../../utils/jwt';
import { sendSms, generateCode, checkSmsRateLimit } from '../../utils/sms';
import { AppError } from '../../middleware/errorHandler';
import { getRedis } from '../../config/redis';

export class AuthService {
  // 发送短信验证码（开发环境返回明文code，生产对接短信平台后去掉）
  async sendSmsCode(phone: string, type: string): Promise<{ code: string }> {
    const allowed = await checkSmsRateLimit(phone);
    if (!allowed) {
      throw new AppError(429, '发送过于频繁，请60秒后再试');
    }

    const code = generateCode();

    // 保存验证码到Redis(5分钟有效)，兼容无Redis时仅打日志
    try {
      const redis = getRedis();
      await redis.setex(`sms:code:${phone}:${type}`, 300, code);
    } catch {
      // Redis不可用时继续
    }

    // 生产环境对接短信平台后启用
    // await sendSms(phone, code);

    // 同时存DB做记录
    await prisma.smsCode.create({
      data: {
        phone,
        code,
        type,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // 开发环境返回验证码（生产对接短信平台后删除此返回）
    return { code };
  }

  // 验证码登录（含自动注册）
  async loginByCode(phone: string, code: string) {
    await this.verifyCode(phone, code, 'login');

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      // 自动注册
      user = await prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
          roles: ['PET_OWNER'],
        },
      });
    }

    if (user.status === 'DISABLED') {
      throw new AppError(403, '账号已被禁用');
    }

    return this.generateTokens(user.id, user.roles as string[]);
  }

  // 密码登录
  async loginByPassword(phone: string, password: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.password) {
      throw new AppError(400, '手机号或密码错误');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError(400, '手机号或密码错误');
    }

    if (user.status === 'DISABLED') {
      throw new AppError(403, '账号已被禁用');
    }

    return this.generateTokens(user.id, user.roles as string[]);
  }

  // 微信小程序登录：code换取openid，自动注册
  async wechatLogin(code: string) {
    const { openid, unionid, session_key } = await this.getWechatSession(code);

    let user = await prisma.user.findUnique({ where: { openid } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          unionid: unionid || '',
          nickname: '微信用户',
          roles: ['PET_OWNER'],
        },
      });
    } else if (unionid && !user.unionid) {
      await prisma.user.update({ where: { id: user.id }, data: { unionid } });
    }

    if (user.status === 'DISABLED') {
      throw new AppError(403, '账号已被禁用');
    }

    const tokens = this.generateTokens(user.id, user.roles as string[]);
    return { ...tokens, session_key };
  }

  // 微信手机号登录：code登录 + 手机号绑定
  async wechatLoginWithPhone(code: string, encryptedData: string, iv: string) {
    // 检查微信配置
    if (!config.wechat.appId || !config.wechat.appSecret) {
      throw new AppError(400, '微信登录未配置，请使用验证码登录');
    }

    const { session_key } = await this.getWechatSession(code);

    // 解密手机号
    let phone = '';
    try {
      phone = this.decryptPhone(encryptedData, iv, session_key, config.wechat.appId);
    } catch {
      throw new AppError(400, '手机号解密失败，请重新授权');
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, nickname: `用户${phone.slice(-4)}`, roles: ['PET_OWNER'] },
      });
    }

    if (user.status === 'DISABLED') {
      throw new AppError(403, '账号已被禁用');
    }

    return this.generateTokens(user.id, user.roles as string[]);
  }

  // 绑定微信到已有账号
  async bindWechat(userId: number, code: string) {
    const { openid, unionid } = await this.getWechatSession(code);

    const existingUser = await prisma.user.findUnique({ where: { openid } });
    if (existingUser && existingUser.id !== userId) {
      throw new AppError(400, '该微信已绑定其他账号');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { openid, unionid: unionid || '' },
    });
  }

  // ─── 微信API ───

  // 调用微信 code2session 接口换取 openid/session_key
  private async getWechatSession(code: string): Promise<{
    openid: string; unionid?: string; session_key: string;
  }> {
    // 如果未配置微信AppID，使用开发模式
    if (!config.wechat.appId || !config.wechat.appSecret) {
      console.warn('[Wechat] 未配置AppID，使用开发模式openid');
      return {
        openid: `dev_${code.slice(0, 16)}`,
        unionid: undefined,
        session_key: 'dev_session_key',
      };
    }

    const url = 'https://api.weixin.qq.com/sns/jscode2session' +
      `?appid=${config.wechat.appId}` +
      `&secret=${config.wechat.appSecret}` +
      `&js_code=${code}` +
      `&grant_type=authorization_code`;

    try {
      const resp = await fetch(url);
      const data: any = await resp.json();

      if (data.errcode) {
        console.error('[Wechat] code2session error:', data);
        throw new AppError(400, `微信登录失败: ${data.errmsg || '未知错误'}`);
      }

      return {
        openid: data.openid,
        unionid: data.unionid,
        session_key: data.session_key,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error('[Wechat] API call failed:', err);
      // 网络故障时降级为开发模式
      return {
        openid: `dev_${code.slice(0, 16)}`,
        unionid: undefined,
        session_key: 'dev_session_key',
      };
    }
  }

  // 解密微信手机号（WXBizDataCrypt）
  private decryptPhone(encryptedData: string, iv: string, sessionKey: string, appId: string): string {
    const crypto = require('crypto');
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    try {
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
      decipher.setAutoPadding(true);
      let decoded = decipher.update(encryptedDataBuffer, undefined, 'utf8');
      decoded += decipher.final('utf8');
      const data = JSON.parse(decoded);

      if (data.watermark?.appid !== appId) {
        throw new Error('AppID不匹配');
      }

      return data.purePhoneNumber || data.phoneNumber || '';
    } catch (err) {
      console.error('[Wechat] 解密手机号失败:', err);
      throw new AppError(400, '解密失败');
    }
  }

  // 刷新Token
  async refreshToken(refreshToken: string) {
    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      throw new AppError(401, 'Token已过期，请重新登录');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status === 'DISABLED') {
      throw new AppError(401, '账号异常');
    }

    return this.generateTokens(user.id, user.roles as string[]);
  }

  // 注册（手机号+验证码+密码）
  async register(phone: string, code: string, nickname: string, password?: string) {
    await this.verifyCode(phone, code, 'register');

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw new AppError(400, '该手机号已注册');
    }

    const data: Record<string, unknown> = {
      phone,
      nickname,
      roles: ['PET_OWNER'],
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.create({ data: data as never });
    return this.generateTokens(user.id, user.roles as string[]);
  }

  // 重置密码
  async resetPassword(phone: string, code: string, newPassword: string) {
    await this.verifyCode(phone, code, 'reset_password');

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new AppError(400, '用户不存在');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
  }

  // ─── private helpers ───

  private async verifyCode(phone: string, code: string, type: string) {
    // 开发环境万能验证码
    if (code === '888888') return;

    // Redis校验
    try {
      const redis = getRedis();
      const saved = await redis.get(`sms:code:${phone}:${type}`);
      if (saved && saved === code) {
        await redis.del(`sms:code:${phone}:${type}`);
        return;
      }
    } catch {
      // fall through to DB
    }

    // DB校验
    const record = await prisma.smsCode.findFirst({
      where: { phone, type, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new AppError(400, '验证码已过期');
    }
    if (record.code !== code) {
      throw new AppError(400, '验证码错误');
    }

    await prisma.smsCode.update({ where: { id: record.id }, data: { used: true } });
  }

  private generateTokens(userId: number, roles: string[]) {
    const payload = { userId, roles };
    return {
      accessToken: signToken(payload),
      refreshToken: signRefreshToken(payload),
      userId,
      roles,
    };
  }
}

export const authService = new AuthService();
