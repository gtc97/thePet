import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { fail } from '../types';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const defaultEnglish = ['Required', 'String must contain at least 1 character(s)', 'Number must be greater than or equal to 0.01'];
        const msgs = err.errors.map(e => {
          // 自定义 message 优先
          if (e.message && !defaultEnglish.includes(e.message)) return e.message;
          // 缺失字段
          if (e.code === 'invalid_type' && e.received === 'undefined') {
            return `缺少必填字段：${e.path.join('.')}`;
          }
          // 类型错误
          if (e.code === 'invalid_type') return `字段「${e.path.join('.')}」类型不正确`;
          if (e.code === 'too_small') return `字段「${e.path.join('.')}」值过小或为空`;
          if (e.code === 'too_big') return `字段「${e.path.join('.')}」值过大或过长`;
          if (e.code === 'invalid_enum_value') return `字段「${e.path.join('.')}」值不在允许范围内`;
          return '参数校验失败';
        });
        const unique = [...new Set(msgs)];
        res.status(400).json(fail(unique.join('; ')));
        return;
      }
      next(err);
    }
  };
}
