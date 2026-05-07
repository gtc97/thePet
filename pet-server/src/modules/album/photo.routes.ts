import { Router, Response, NextFunction } from 'express';
import { photoService } from './photo.service';
import { authMiddleware, optionalAuth } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';

const router = Router({ mergeParams: true });

// 照片列表
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await photoService.listByPet(
      parseInt(req.params.petId), req.user?.userId,
      req.query.albumId ? parseInt(req.query.albumId as string) : undefined,
      req.query.sourceType as string | undefined
    );
    res.json(success(data));
  } catch (err) { next(err); }
});

// 批量添加照片（上传后关联）
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await photoService.addPhotos(
      parseInt(req.params.petId), req.user!.userId, req.body.photos || [], req.body.albumId
    );
    res.json(success(data, `成功添加${data.count}张照片`));
  } catch (err) { next(err); }
});

// 更新照片信息
router.put('/:photoId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await photoService.updatePhoto(
      parseInt(req.params.photoId), parseInt(req.params.petId), req.user!.userId, req.body
    );
    res.json(success(data, '更新成功'));
  } catch (err) { next(err); }
});

// 删除照片
router.delete('/:photoId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await photoService.deletePhoto(
      parseInt(req.params.photoId), parseInt(req.params.petId), req.user!.userId
    );
    res.json(success(null, '照片已删除'));
  } catch (err) { next(err); }
});

export default router;
