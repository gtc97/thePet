import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { getUploadPath, getThumbnailPath, getPublicUrl } from '../../utils/fileStorage';
import { AppError } from '../../middleware/errorHandler';

export class UploadService {
  async uploadImage(file: Express.Multer.File, module: string, userId: number) {
    const ext = path.extname(file.originalname) || '.jpg';
    const destPath = getUploadPath(module, userId, ext);

    // 使用sharp进行压缩和尺寸调整
    try {
      const image = sharp(file.path);
      const metadata = await image.metadata();

      // 最大宽度1920px，JPEG质量80%
      await image
        .resize(1920, undefined, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(destPath);

      // 生成缩略图 (400px宽)
      const thumbPath = getThumbnailPath(destPath);
      await sharp(file.path)
        .resize(400, undefined, { fit: 'inside' })
        .jpeg({ quality: 70 })
        .toFile(thumbPath);

      // 清理临时文件
      fs.unlinkSync(file.path);

      return {
        url: getPublicUrl(destPath),
        thumbnailUrl: getPublicUrl(thumbPath),
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: fs.statSync(destPath).size,
      };
    } catch (err) {
      // 如果sharp处理失败，直接移动原始文件
      fs.renameSync(file.path, destPath);
      return {
        url: getPublicUrl(destPath),
        thumbnailUrl: getPublicUrl(destPath),
        width: 0,
        height: 0,
        size: fs.statSync(destPath).size,
      };
    }
  }

  async uploadVideo(file: Express.Multer.File, module: string, userId: number) {
    const ext = path.extname(file.originalname) || '.mp4';
    const destPath = getUploadPath(module, userId, ext);
    fs.renameSync(file.path, destPath);

    return {
      url: getPublicUrl(destPath),
      thumbnailUrl: null,
      width: 0,
      height: 0,
      size: fs.statSync(destPath).size,
    };
  }

  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  isVideo(mimetype: string): boolean {
    return mimetype.startsWith('video/');
  }
}

export const uploadService = new UploadService();
