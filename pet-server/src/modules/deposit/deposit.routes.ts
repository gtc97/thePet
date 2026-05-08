import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// 我的押金状态
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deposit = await prisma.deposit.findFirst({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(success(deposit || { status: 'UNPAID', amount: 0 }));
  } catch (err) { next(err); }
});

// 缴纳押金（模拟微信支付）
router.post('/pay', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const amount = parseFloat((req.body.amount || '100').toString());
    if (amount <= 0) throw new AppError(400, '金额无效');

    let deposit = await prisma.deposit.findFirst({ where: { userId: req.user!.userId, status: { in: ['PAID', 'UNPAID'] } } });
    if (deposit?.status === 'PAID') throw new AppError(400, '押金已缴纳');

    // 模拟微信支付
    const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

    if (deposit) {
      deposit = await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'PAID', amount, transactionId, paidAt: new Date() },
      });
    } else {
      deposit = await prisma.deposit.create({
        data: { userId: req.user!.userId, amount, status: 'PAID', transactionId, paidAt: new Date() },
      });
    }
    await prisma.depositLog.create({
      data: { depositId: deposit.id, action: 'pay', amount, remark: '押金缴纳' },
    });
    await prisma.user.update({ where: { id: req.user!.userId }, data: { depositPaid: true } });

    res.json(success(deposit, '押金缴纳成功'));
  } catch (err) { next(err); }
});

// 押金流水
router.get('/me/logs', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deposit = await prisma.deposit.findFirst({ where: { userId: req.user!.userId } });
    if (!deposit) return res.json(success([]));
    const logs = await prisma.depositLog.findMany({
      where: { depositId: deposit.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(success(logs));
  } catch (err) { next(err); }
});

export default router;
