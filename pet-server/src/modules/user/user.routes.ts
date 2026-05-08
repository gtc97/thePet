import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middleware/auth';

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

router.get('/:id', authMiddleware, (req, res, next) =>
  userController.getPublicProfile(req, res, next)
);

export default router;
