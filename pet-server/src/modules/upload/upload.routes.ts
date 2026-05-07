import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authMiddleware } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.post('/image', authMiddleware, upload.single('file'), (req, res, next) =>
  uploadController.uploadSingle(req, res, next)
);

router.post('/images', authMiddleware, upload.array('files', 9), (req, res, next) =>
  uploadController.uploadMultiple(req, res, next)
);

router.post('/video', authMiddleware, upload.single('file'), (req, res, next) =>
  uploadController.uploadSingle(req, res, next)
);

export default router;
