import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest, fail } from '../types';

// JWT 认证中间件
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(fail('未登录，请先登录'));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json(fail('登录已过期，请重新登录'));
  }
}

// 可选认证：有token就解析，无token也放行
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.slice(7));
    } catch {
      // ignore
    }
  }
  next();
}

// 角色守卫
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(fail('未登录'));
      return;
    }
    const hasRole = req.user.roles.some(r => roles.includes(r));
    if (!hasRole) {
      res.status(403).json(fail('无权限访问'));
      return;
    }
    next();
  };
}
