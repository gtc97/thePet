import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// 黑名单列表
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.blacklist.findMany({
      where: { userId: req.user!.userId },
      include: { blocked: { select: { id: true, nickname: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(success(list));
  } catch (err) { next(err); }
});

// 拉黑用户
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const blockedUserId = req.body.blockedUserId;
    if (blockedUserId === req.user!.userId) throw new AppError(400, '不能拉黑自己');

    const existing = await prisma.blacklist.findFirst({
      where: { userId: req.user!.userId, blockedUserId },
    });
    if (existing) throw new AppError(400, '已拉黑该用户');

    const entry = await prisma.blacklist.create({
      data: { userId: req.user!.userId, blockedUserId, reason: req.body.reason || '' },
    });
    res.json(success(entry, '已拉黑'));
  } catch (err) { next(err); }
});

// 解除拉黑
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entry = await prisma.blacklist.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user!.userId },
    });
    if (!entry) throw new AppError(404, '记录不存在');
    await prisma.blacklist.delete({ where: { id: entry.id } });
    res.json(success(null, '已解除拉黑'));
  } catch (err) { next(err); }
});

export default router;
