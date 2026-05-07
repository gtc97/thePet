import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { signToken, signRefreshToken, verifyToken } from '../../utils/jwt';
import { sendSms, generateCode, checkSmsRateLimit } from '../../utils/sms';
import { AppError } from '../../middleware/errorHandler';
import { getRedis } from '../../config/redis';

export class AuthService {
  // 发送短信验证码
  async sendSmsCode(phone: string, type: string): Promise<void> {
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

    await sendSms(phone, code);

    // 同时存DB做记录
    await prisma.smsCode.create({
      data: {
        phone,
        code,
        type,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
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

  // 微信小程序登录
  async wechatLogin(code: string) {
    // TODO: 调用微信接口换取 openid
    // const { openid, unionid, session_key } = await this.getWechatSession(code);
    // 当前使用模拟数据
    const openid = `mock_openid_${code.slice(0, 10)}`;

    let user = await prisma.user.findUnique({ where: { openid } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          nickname: '微信用户',
          roles: ['PET_OWNER'],
        },
      });
    }

    if (user.status === 'DISABLED') {
      throw new AppError(403, '账号已被禁用');
    }

    return this.generateTokens(user.id, user.roles as string[]);
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
