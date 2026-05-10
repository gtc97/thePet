import { Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { AuthRequest, success } from '../../types';

export class OrderController {
  // POST /orders — 创建订单
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.create(req.user!.userId, req.body);
      res.json(success(data, '下单成功，等待宠护师接单'));
    } catch (err) { next(err); }
  }

  // GET /orders — 我的订单列表
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string || req.user!.roles[0];
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const data = await orderService.listMyOrders(req.user!.userId, role, status, page, pageSize);
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // GET /orders/nearby — 附近可接订单
  async listNearby(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const data = await orderService.listNearby(req.user!.userId, page, pageSize);
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // GET /orders/:id — 订单详情
  async getDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.getDetail(parseInt(req.params.id));
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // GET /orders/:id/timeline — 状态时间线
  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.getTimeline(parseInt(req.params.id));
      res.json(success(data));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/accept — 宠护师接单
  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.accept(parseInt(req.params.id), req.user!.userId);
      res.json(success(data, '接单成功'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/reject — 宠护师拒单
  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.reject(parseInt(req.params.id), req.user!.userId, req.body.reason);
      res.json(success(data, '已拒绝'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/start — 开始服务
  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.startService(parseInt(req.params.id), req.user!.userId);
      res.json(success(data, '服务已开始'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/pay — 宠主确认付款
  async pay(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.payOrder(parseInt(req.params.id), req.user!.userId, req.body.paymentProof);
      res.json(success(data, '已确认付款'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/complete — 宠护师完成服务
  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.completeService(parseInt(req.params.id), req.user!.userId, req.body);
      res.json(success(data, '服务已完成，等待宠主验收'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/apply — 宠护师申请接单
  async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await orderService.applyOrder(parseInt(req.params.id), req.user!.userId);
      res.json(success(null, '已申请，等待宠主确认'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/select — 宠主选择宠护师
  async select(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.selectProvider(parseInt(req.params.id), req.user!.userId, req.body.providerId);
      res.json(success(data, '已选择宠护师'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/confirm — 宠主确认验收
  async confirm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.confirmOrder(parseInt(req.params.id), req.user!.userId);
      res.json(success(data, '已确认验收，订单完成'));
    } catch (err) { next(err); }
  }

  // POST /orders/:id/cancel — 取消订单
  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await orderService.cancel(parseInt(req.params.id), req.user!.userId, req.body.reason);
      res.json(success(data, '订单已取消'));
    } catch (err) { next(err); }
  }
}

export const orderController = new OrderController();
