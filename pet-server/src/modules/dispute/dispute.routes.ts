import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// 发起申诉
router.post('/:orderId/disputes', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.ownerId !== req.user!.userId && order.providerId !== req.user!.userId) {
      throw new AppError(403, '无权操作');
    }

    // 检查是否已有进行中的申诉
    const existing = await prisma.dispute.findFirst({
      where: { orderId, status: { in: ['PENDING', 'REVIEWING'] } },
    });
    if (existing) throw new AppError(400, '已有进行中的申诉');

    const dispute = await prisma.dispute.create({
      data: {
        orderId, initiatorId: req.user!.userId,
        type: req.body.type, reason: req.body.reason,
        description: req.body.description || '',
        images: req.body.images || [],
      },
    });

    // 订单状态标记为申诉中
    await prisma.serviceOrder.update({ where: { id: orderId }, data: { status: 'DISPUTE' } });

    res.json(success(dispute, '申诉已提交'));
  } catch (err) { next(err); }
});

// 我的申诉列表
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.dispute.findMany({
      where: { initiatorId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { orderNo: true } } },
    });
    res.json(success(list));
  } catch (err) { next(err); }
});

// 申诉详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dispute = await prisma.dispute.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!dispute) throw new AppError(404, '申诉不存在');
    res.json(success(dispute));
  } catch (err) { next(err); }
});

// 撤销申诉
router.put('/:id/cancel', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dispute = await prisma.dispute.findFirst({
      where: { id: parseInt(req.params.id), initiatorId: req.user!.userId },
    });
    if (!dispute) throw new AppError(404, '申诉不存在');
    if (!['PENDING', 'REVIEWING'].includes(dispute.status)) throw new AppError(400, '申诉已处理，无法撤销');

    await prisma.dispute.update({ where: { id: dispute.id }, data: { status: 'REJECTED', resolution: '用户自行撤销' } });
    await prisma.serviceOrder.update({ where: { id: dispute.orderId }, data: { status: 'COMPLETED' } });
    res.json(success(null, '申诉已撤销'));
  } catch (err) { next(err); }
});

export default router;
