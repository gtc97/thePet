import { z } from 'zod';

export const sendSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  type: z.enum(['login', 'register', 'reset_password', 'bind']),
});

export const loginByCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  code: z.string().length(6, '验证码为6位数字'),
});

export const loginByPasswordSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

export const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  code: z.string().length(6, '验证码为6位数字'),
  nickname: z.string().min(1, '昵称不能为空').max(50),
  password: z.string().min(6, '密码至少6位').optional(),
});

export const wechatLoginSchema = z.object({
  code: z.string().min(1, 'code不能为空'),
  encryptedData: z.string().optional(),
  iv: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
