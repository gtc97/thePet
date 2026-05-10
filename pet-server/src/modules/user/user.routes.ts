import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest } from '../../types';

const router = Router();

router.get('/me/stats', authMiddleware, (req, res, next) =>
  userController.getStats(req, res, next)
);

router.get('/me', authMiddleware, (req, res, next) =>
  userController.getProfile(req, res, next)
);

router.put('/me', authMiddleware, (req, res, next) =>
  userController.updateProfile(req, res, next)
);

router.post('/me/qualification', authMiddleware, (req, res, next) =>
  userController.submitQualification(req, res, next)
);

router.put('/me/roles', authMiddleware, (req, res, next) =>
  userController.switchRole(req, res, next)
);

router.get('/me/locations', authMiddleware, (req, res, next) =>
  userController.getLocations(req, res, next)
);

router.post('/me/locations', authMiddleware, (req, res, next) =>
  userController.addLocation(req, res, next)
);

router.put('/me/locations/:id', authMiddleware, (req, res, next) =>
  userController.updateLocation(req, res, next)
);

router.delete('/me/locations/:id', authMiddleware, (req, res, next) =>
  userController.deleteLocation(req, res, next)
);

// 宠护师服务管理
router.put('/me/services', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { default: prisma } = await import('../../config/database');
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { providerServices: req.body.services || [] },
    });
    res.json({ code: 0, message: '服务已更新', data: null });
  } catch (err) { next(err); }
});

router.get('/:id', authMiddleware, (req, res, next) =>
  userController.getPublicProfile(req, res, next)
);

export default router;
