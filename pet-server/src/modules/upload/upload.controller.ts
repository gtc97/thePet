import { Response, NextFunction } from 'express';
import { uploadService } from './upload.service';
import { AuthRequest, success, fail } from '../../types';

export class UploadController {
  async uploadSingle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json(fail('请选择文件'));
        return;
      }
      const module = req.body.module || 'common';
      let result;
      if (uploadService.isImage(req.file.mimetype)) {
        result = await uploadService.uploadImage(req.file, module, req.user!.userId);
      } else if (uploadService.isVideo(req.file.mimetype)) {
        result = await uploadService.uploadVideo(req.file, module, req.user!.userId);
      } else {
        res.status(400).json(fail('不支持的文件类型'));
        return;
      }
      res.json(success(result, '上传成功'));
    } catch (err) {
      next(err);
    }
  }

  async uploadMultiple(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json(fail('请选择文件'));
        return;
      }

      const module = req.body.module || 'common';
      const results = [];
      const files = req.files as Express.Multer.File[];

      for (const file of files) {
        if (uploadService.isImage(file.mimetype)) {
          const result = await uploadService.uploadImage(file, module, req.user!.userId);
          results.push({ ...result, type: 'image' });
        } else if (uploadService.isVideo(file.mimetype)) {
          const result = await uploadService.uploadVideo(file, module, req.user!.userId);
          results.push({ ...result, type: 'video' });
        }
      }

      res.json(success(results, `成功上传${results.length}个文件`));
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();
