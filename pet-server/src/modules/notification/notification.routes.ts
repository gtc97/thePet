import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import prisma from '../../config/database';

const router = Router();

// 通知列表
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const [list, total] = await Promise.all([
      prisma.pushLog.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.pushLog.count({ where: { userId: req.user!.userId } }),
    ]);
    res.json(success({ list, total, page, pageSize }));
  } catch (err) { next(err); }
});

// 未读计数
router.get('/unread-count', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.pushLog.count({
      where: { userId: req.user!.userId, isRead: false },
    });
    res.json(success({ count }));
  } catch (err) { next(err); }
});

// 标记已读
router.put('/:id/read', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.pushLog.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true, readAt: new Date() },
    });
    res.json(success(null, '已标记'));
  } catch (err) { next(err); }
});

// 全部已读
router.put('/read-all', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.pushLog.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json(success(null, '已全部标记'));
  } catch (err) { next(err); }
});

export default router;
