import { Response, NextFunction } from 'express';
import { userService } from './user.service';
import { AuthRequest, success } from '../../types';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getProfile(req.user!.userId);
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }

  async getPublicProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getPublicProfile(parseInt(req.params.id));
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateProfile(req.user!.userId, req.body);
      res.json(success(data, '更新成功'));
    } catch (err) {
      next(err);
    }
  }

  async submitQualification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.submitQualification(req.user!.userId, req.body);
      res.json(success(data, '资质申请已提交，等待审核'));
    } catch (err) {
      next(err);
    }
  }

  async switchRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.switchRole(req.user!.userId, req.body.role);
      res.json(success(data, '身份切换成功'));
    } catch (err) {
      next(err);
    }
  }

  async getLocations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getLocations(req.user!.userId);
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }

  async addLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.addLocation(req.user!.userId, req.body);
      res.json(success(data, '地址添加成功'));
    } catch (err) {
      next(err);
    }
  }

  async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateLocation(
        parseInt(req.params.id), req.user!.userId, req.body
      );
      res.json(success(data, '地址更新成功'));
    } catch (err) {
      next(err);
    }
  }

  async deleteLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteLocation(parseInt(req.params.id), req.user!.userId);
      res.json(success(null, '地址已删除'));
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
