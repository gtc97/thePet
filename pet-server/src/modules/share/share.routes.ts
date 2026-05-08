import { Router, Response, NextFunction } from 'express';
import { shareService } from './share.service';
import { authMiddleware, optionalAuth } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';

const router = Router();

// 公开广场 — 可选认证
router.get('/', optionalAuth, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const list = await prisma.petShare.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        pet: { select: { id: true, name: true, avatar: true, breed: true } },
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    res.json(success(list));
  } catch (err) { next(err); }
});

// 通过分享码查看 — 无需登录
router.get('/code/:code', async (req, res, next) => {
  try {
    const data = await shareService.getByCode(req.params.code);
    res.json(success(data));
  } catch (err) { next(err); }
});

// 获取分享详情
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const data = await shareService.getDetail(parseInt(req.params.id));
    res.json(success(data));
  } catch (err) { next(err); }
});

// 点赞分享
router.post('/:id/like', async (req, res, next) => {
  try {
    const data = await shareService.like(parseInt(req.params.id));
    res.json(success(data, '点赞成功'));
  } catch (err) { next(err); }
});

// 取消点赞
router.delete('/:id/like', async (req, res, next) => {
  try {
    const data = await shareService.unlike(parseInt(req.params.id));
    res.json(success(data, '已取消点赞'));
  } catch (err) { next(err); }
});

// 创建分享 — 需登录
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await shareService.create(req.body.petId, req.user!.userId, req.body);
    res.json(success(data, '分享创建成功'));
  } catch (err) { next(err); }
});

// 删除分享
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await shareService.delete(parseInt(req.params.id), req.user!.userId);
    res.json(success(null, '分享已删除'));
  } catch (err) { next(err); }
});

export default router;
