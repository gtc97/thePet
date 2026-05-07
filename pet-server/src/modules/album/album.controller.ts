import { Response, NextFunction } from 'express';
import { albumService } from './album.service';
import { AuthRequest, success } from '../../types';

export class AlbumController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await albumService.listByPet(
        parseInt(req.params.petId), req.user?.userId
      );
      res.json(success(data));
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await albumService.create(
        parseInt(req.params.petId), req.user!.userId, req.body
      );
      res.json(success(data, '相册创建成功'));
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await albumService.update(
        parseInt(req.params.id), parseInt(req.params.petId), req.user!.userId, req.body
      );
      res.json(success(data, '相册更新成功'));
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await albumService.delete(
        parseInt(req.params.id), parseInt(req.params.petId), req.user!.userId
      );
      res.json(success(null, '相册已删除'));
    } catch (err) { next(err); }
  }
}

export const albumController = new AlbumController();
