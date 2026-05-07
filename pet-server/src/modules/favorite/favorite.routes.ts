import { Router, Response, NextFunction } from 'express';
import { favoriteService } from './favorite.service';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await favoriteService.listByUser(req.user!.userId);
    res.json(success(data));
  } catch (err) { next(err); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await favoriteService.add(
      req.user!.userId, req.body.targetType, req.body.targetId
    );
    res.json(success(data, '收藏成功'));
  } catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await favoriteService.remove(parseInt(req.params.id), req.user!.userId);
    res.json(success(null, '已取消收藏'));
  } catch (err) { next(err); }
});

export default router;
