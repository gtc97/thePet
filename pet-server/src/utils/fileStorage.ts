import path from 'path';
import fs from 'fs';
import { config } from '../config';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getUploadPath(module: string, userId: number, ext: string): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const dir = path.join(config.upload.dir, module, String(userId), dateStr);
  ensureDir(dir);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  return path.join(dir, filename);
}

export function getThumbnailPath(originalPath: string): string {
  const dir = path.dirname(originalPath).replace(config.upload.dir, path.join(config.upload.dir, 'thumbnails'));
  ensureDir(dir);
  const ext = path.extname(originalPath);
  const basename = path.basename(originalPath, ext);
  return path.join(dir, `${basename}_thumb${ext}`);
}

export function getPublicUrl(filePath: string): string {
  // 相对于 uploads 目录的路径
  return '/' + path.relative(config.upload.dir, filePath).replace(/\\/g, '/');
}
