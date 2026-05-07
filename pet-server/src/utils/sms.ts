import { getRedis } from '../config/redis';

// 生成6位随机验证码
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送短信验证码（当前为模拟实现，生产环境对接阿里云/腾讯云短信SDK）
export async function sendSms(phone: string, code: string): Promise<boolean> {
  // TODO: 接入短信服务商 SDK
  console.log(`[SMS] To: ${phone}, Code: ${code}`);
  return true;
}

// 验证码频率限制：60秒内同一手机号只能发送1次
export async function checkSmsRateLimit(phone: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const key = `sms:rate:${phone}`;
    const exists = await redis.exists(key);
    if (exists) return false;
    await redis.setex(key, 60, '1');
    return true;
  } catch {
    return true; // Redis不可用时放行
  }
}
