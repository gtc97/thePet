import { Request, Response, NextFunction } from 'express';
import { fail } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: number = 1
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[Error] ${err.message}`, err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message, err.code));
    return;
  }

  // Multer file size error
  if (err.message === 'File too large') {
    res.status(413).json(fail('文件大小超出限制'));
    return;
  }

  res.status(500).json(fail('服务器内部错误'));
}
