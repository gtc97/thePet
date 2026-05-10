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
  console.error(`[Error] ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message, err.code));
    return;
  }

  // Multer
  if (err.message === 'File too large') {
    res.status(413).json(fail('文件大小超出限制'));
    return;
  }

  // Zod 验证错误（非 validator 中间件场景）
  if (err.name === 'ZodError') {
    res.status(400).json(fail('请求参数校验失败'));
    return;
  }

  // JSON 解析错误
  if (err.message?.includes('Unexpected token') || err.message?.includes('JSON')) {
    res.status(400).json(fail('请求格式错误，请检查参数'));
    return;
  }

  // Prisma 常见错误转中文
  const msg = err.message || '';
  if (msg.includes('PrismaClientValidationError')) {
    res.status(400).json(fail('请求参数格式不正确'));
    return;
  }
  if (msg.includes('PrismaClientKnownRequestError')) {
    if (msg.includes('Unique constraint')) {
      res.status(409).json(fail('数据已存在，请勿重复操作'));
      return;
    }
    if (msg.includes('Foreign key constraint')) {
      res.status(400).json(fail('关联数据不存在'));
      return;
    }
    res.status(400).json(fail('数据操作异常，请重试'));
    return;
  }
  if (msg.includes('body')) {
    res.status(400).json(fail('请求格式错误，请检查参数'));
    return;
  }

  res.status(500).json(fail('服务器内部错误'));
}
