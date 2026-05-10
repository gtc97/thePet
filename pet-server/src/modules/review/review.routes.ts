import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// 提交评价
router.post('/:orderId(\\d+)/reviews', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const reviewerId = req.user!.userId;
    const { rating, content, tags, images } = req.body;

    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== 'COMPLETED') throw new AppError(400, '订单未完成，无法评价');

    // 确定评价对象
    const isOwner = order.ownerId === reviewerId;
    const isProvider = order.providerId === reviewerId;
    if (!isOwner && !isProvider) throw new AppError(403, '无权评价');
    const revieweeId = isOwner ? order.providerId! : order.ownerId;

    // 检查是否已评价
    const existing = await prisma.review.findFirst({ where: { orderId, reviewerId } });
    if (existing) throw new AppError(400, '已评价过该订单');

    const review = await prisma.review.create({
      data: { orderId, reviewerId, revieweeId, rating, content: content || '', tags: tags || [], images: images || [] },
    });

    // 重新计算被评价人的平均分
    const avgResult = await prisma.review.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        avgRating: avgResult._avg.rating || 0,
        totalOrders: avgResult._count.rating,
      },
    });

    res.json(success(review, '评价提交成功'));
  } catch (err) { next(err); }
});

// 查看订单评价
router.get('/:orderId(\\d+)/reviews', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { orderId: parseInt(req.params.orderId) },
      include: {
        reviewer: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    res.json(success(reviews));
  } catch (err) { next(err); }
});

// 某用户收到的评价
router.get('/users/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        reviewer: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    res.json(success(reviews));
  } catch (err) { next(err); }
});

export default router;
