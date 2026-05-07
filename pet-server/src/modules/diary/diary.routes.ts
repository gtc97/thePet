import { Router, Response, NextFunction } from 'express';
import { diaryService } from './diary.service';
import { authMiddleware, optionalAuth } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';

const router = Router({ mergeParams: true });

// 日记列表
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const data = await diaryService.listByPet(
      parseInt(req.params.petId), req.user?.userId, page, pageSize
    );
    res.json(success(data));
  } catch (err) { next(err); }
});

// 日记详情
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await diaryService.getDetail(
      parseInt(req.params.id), parseInt(req.params.petId), req.user?.userId
    );
    res.json(success(data));
  } catch (err) { next(err); }
});

// 创建日记
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await diaryService.create(
      parseInt(req.params.petId), req.user!.userId, req.body
    );
    res.json(success(data, '日记创建成功'));
  } catch (err) { next(err); }
});

// 编辑日记
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await diaryService.update(
      parseInt(req.params.id), parseInt(req.params.petId), req.user!.userId, req.body
    );
    res.json(success(data, '日记更新成功'));
  } catch (err) { next(err); }
});

// 删除日记
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await diaryService.delete(
      parseInt(req.params.id), parseInt(req.params.petId), req.user!.userId
    );
    res.json(success(null, '日记已删除'));
  } catch (err) { next(err); }
});

// 切换置顶
router.post('/:id/pin', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await diaryService.togglePin(
      parseInt(req.params.id), parseInt(req.params.petId), req.user!.userId
    );
    res.json(success(data, data.isPinned ? '已置顶' : '已取消置顶'));
  } catch (err) { next(err); }
});

export default router;
