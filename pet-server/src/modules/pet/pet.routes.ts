import { Router } from 'express';
import { petController } from './pet.controller';
import { authMiddleware, optionalAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import { createPetSchema, updatePetSchema } from './pet.schema';

const router = Router();

// 公开列表 — 可选认证（用于首页发现）
router.get('/public', optionalAuth, (req, res, next) =>
  petController.listPublic(req, res, next)
);

// 我的宠物列表 — 需登录
router.get('/', authMiddleware, (req, res, next) =>
  petController.list(req, res, next)
);

// 宠物详情 — 可选认证（公开宠物无需登录即可查看）
router.get('/:id', optionalAuth, (req, res, next) =>
  petController.getDetail(req, res, next)
);

// 添加宠物 — 需登录
router.post('/', authMiddleware, validate(createPetSchema), (req, res, next) =>
  petController.create(req, res, next)
);

// 编辑宠物 — 需登录（归属权在Service中校验）
router.put('/:id', authMiddleware, validate(updatePetSchema), (req, res, next) =>
  petController.update(req, res, next)
);

// 删除宠物 — 需登录
router.delete('/:id', authMiddleware, (req, res, next) =>
  petController.delete(req, res, next)
);

// 封存档案
router.post('/:id/archive', authMiddleware, (req, res, next) =>
  petController.archive(req, res, next)
);

// 解除封存
router.post('/:id/unarchive', authMiddleware, (req, res, next) =>
  petController.unarchive(req, res, next)
);

// 数据统计
router.get('/:id/stats', optionalAuth, (req, res, next) =>
  petController.getStats(req, res, next)
);

// 宠物服务记录
router.get('/:id/orders', authMiddleware, async (req, res, next) => {
  try {
    const { default: prisma } = await import('../../config/database');
    const petId = parseInt(req.params.id);
    // petIds 是JSON数组，用 path 查询
    const orders = await prisma.serviceOrder.findMany({
      where: { petIds: { path: '$', array_contains: [petId] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, orderNo: true, serviceType: true, status: true,
        price: true, scheduledDate: true, createdAt: true, completedAt: true,
        provider: { select: { id: true, nickname: true, avatar: true, avgRating: true } },
      },
    });
    res.json({ code: 0, data: orders });
  } catch (err) { next(err); }
});

export default router;
