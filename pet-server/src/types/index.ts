import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  roles: string[];
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export function success<T>(data?: T, message = 'ok'): ApiResponse<T> {
  return { code: 0, message, data };
}

export function fail(message: string, code = 1): ApiResponse<null> {
  return { code, message, data: null };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
