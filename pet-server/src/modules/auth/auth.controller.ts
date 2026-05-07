import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { success } from '../../types';

export class AuthController {
  async sendSmsCode(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.sendSmsCode(req.body.phone, req.body.type);
      res.json(success(null, '验证码已发送'));
    } catch (err) {
      next(err);
    }
  }

  async loginByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginByCode(req.body.phone, req.body.code);
      res.json(success(result, '登录成功'));
    } catch (err) {
      next(err);
    }
  }

  async loginByPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginByPassword(req.body.phone, req.body.password);
      res.json(success(result, '登录成功'));
    } catch (err) {
      next(err);
    }
  }

  async wechatLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.wechatLogin(req.body.code);
      res.json(success(result, '登录成功'));
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(
        req.body.phone, req.body.code, req.body.nickname, req.body.password
      );
      res.json(success(result, '注册成功'));
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.phone, req.body.code, req.body.newPassword);
      res.json(success(null, '密码已重置'));
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
