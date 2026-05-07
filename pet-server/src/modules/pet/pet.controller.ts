import { Response, NextFunction } from 'express';
import { petService } from './pet.service';
import { AuthRequest, success } from '../../types';

export class PetController {
  // GET /pets — 我的宠物列表
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isArchived = req.query.archived === '1';
      const data = await petService.listByOwner(req.user!.userId, isArchived);
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // GET /pets/public — 公开宠物列表（首页发现）
  async listPublic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const data = await petService.listPublic(page, pageSize);
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // GET /pets/:id — 宠物详情
  async getDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await petService.getDetail(
        parseInt(req.params.id), req.user?.userId
      );
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // POST /pets — 创建宠物
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await petService.create(req.user!.userId, req.body);
      res.json(success(data, '宠物添加成功'));
    } catch (err) { next(err); }
  }

  // PUT /pets/:id — 更新宠物
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await petService.update(
        parseInt(req.params.id), req.user!.userId, req.body
      );
      res.json(success(data, '更新成功'));
    } catch (err) { next(err); }
  }

  // DELETE /pets/:id — 删除宠物
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await petService.delete(parseInt(req.params.id), req.user!.userId);
      res.json(success(null, '宠物已删除'));
    } catch (err) { next(err); }
  }

  // POST /pets/:id/archive — 封存档案
  async archive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await petService.archive(parseInt(req.params.id), req.user!.userId);
      res.json(success(data, '档案已封存'));
    } catch (err) { next(err); }
  }

  // POST /pets/:id/unarchive — 解除封存
  async unarchive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await petService.unarchive(parseInt(req.params.id), req.user!.userId);
      res.json(success(data, '封存已解除'));
    } catch (err) { next(err); }
  }

  // GET /pets/:id/stats — 数据统计
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await petService.getStats(
        parseInt(req.params.id), req.user?.userId
      );
      res.json(success(data));
    } catch (err) { next(err); }
  }
}

export const petController = new PetController();
