import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validator';
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
