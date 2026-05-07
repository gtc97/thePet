import { Router } from 'express';
import { albumController } from './album.controller';
import { authMiddleware, optionalAuth } from '../../middleware/auth';

const router = Router({ mergeParams: true });

// 相册列表 — 可选认证（公开宠物相册可查看）
router.get('/', optionalAuth, (req, res, next) =>
  albumController.list(req, res, next)
);

// 创建相册
router.post('/', authMiddleware, (req, res, next) =>
  albumController.create(req, res, next)
);

// 更新相册
router.put('/:id', authMiddleware, (req, res, next) =>
  albumController.update(req, res, next)
);

// 删除相册
router.delete('/:id', authMiddleware, (req, res, next) =>
  albumController.delete(req, res, next)
);

export default router;
