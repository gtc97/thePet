import { Router } from 'express';
import { orderController } from './order.controller';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import { createOrderSchema, cancelOrderSchema, completeOrderSchema } from './order.schema';

const router = Router();

// 订单列表（身份感知：宠主查自己的单 / 师傅查接的单）
router.get('/', authMiddleware, (req, res, next) =>
  orderController.list(req, res, next)
);

// 附近可接订单（师傅视角）
router.get('/nearby', authMiddleware, (req, res, next) =>
  orderController.listNearby(req, res, next)
);

// 创建订单（宠主）
router.post('/', authMiddleware, validate(createOrderSchema), (req, res, next) =>
  orderController.create(req, res, next)
);

// 订单详情
router.get('/:id', authMiddleware, (req, res, next) =>
  orderController.getDetail(req, res, next)
);

// 状态时间线
router.get('/:id/timeline', authMiddleware, (req, res, next) =>
  orderController.getTimeline(req, res, next)
);

// 接单（师傅）
router.post('/:id/accept', authMiddleware, (req, res, next) =>
  orderController.accept(req, res, next)
);

// 拒单（师傅）
router.post('/:id/reject', authMiddleware, (req, res, next) =>
  orderController.reject(req, res, next)
);

// 开始服务（师傅）
router.post('/:id/start', authMiddleware, (req, res, next) =>
  orderController.start(req, res, next)
);

// 申请接单（师傅）
router.post('/:id/apply', authMiddleware, (req, res, next) =>
  orderController.apply(req, res, next)
);

// 选择师傅（宠主）
router.post('/:id/select', authMiddleware, (req, res, next) =>
  orderController.select(req, res, next)
);

// 确认付款（宠主）
router.post('/:id/pay', authMiddleware, (req, res, next) =>
  orderController.pay(req, res, next)
);

// 完成服务（师傅）
router.post('/:id/complete', authMiddleware, validate(completeOrderSchema), (req, res, next) =>
  orderController.complete(req, res, next)
);

// 确认验收（宠主）
router.post('/:id/confirm', authMiddleware, (req, res, next) =>
  orderController.confirm(req, res, next)
);

// 取消订单
router.post('/:id/cancel', authMiddleware, validate(cancelOrderSchema), (req, res, next) =>
  orderController.cancel(req, res, next)
);

export default router;
