import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest, fail } from '../types';

// 管理员认证中间件：验证JWT + admin角色
export function adminAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(fail('未登录'));
    return;
  }

  try {
    const payload = verifyToken(authHeader.slice(7));
    if (!payload.roles.includes('ADMIN')) {
      res.status(403).json(fail('无管理员权限'));
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json(fail('登录已过期'));
  }
}
