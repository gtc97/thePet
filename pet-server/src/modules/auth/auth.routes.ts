import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validator';
import { authMiddleware } from '../../middleware/auth';
import {
  sendSmsSchema,
  loginByCodeSchema,
  loginByPasswordSchema,
  registerSchema,
  refreshTokenSchema,
} from './auth.schema';

const router = Router();

router.post('/send-sms-code', validate(sendSmsSchema), (req, res, next) =>
  authController.sendSmsCode(req, res, next)
);

router.post('/login-by-code', validate(loginByCodeSchema), (req, res, next) =>
  authController.loginByCode(req, res, next)
);

router.post('/login-by-password', validate(loginByPasswordSchema), (req, res, next) =>
  authController.loginByPassword(req, res, next)
);

router.post('/wechat-login', (req, res, next) =>
  authController.wechatLogin(req, res, next)
);

// 微信手机号授权登录
router.post('/wechat-phone-login', (req, res, next) =>
  authController.wechatLoginWithPhone(req, res, next)
);

// 绑定微信到已登录账号
router.post('/bind-wechat', authMiddleware, (req, res, next) =>
  authController.bindWechat(req, res, next)
);

router.post('/register', validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/reset-password', (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.post('/refresh-token', validate(refreshTokenSchema), (req, res, next) =>
  authController.refreshToken(req, res, next)
);

export default router;
