import { Router, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { adminAuth } from '../../middleware/adminAuth';
import { AuthRequest, success } from '../../types';

const router = Router();

// ─── 认证（不需要admin中间件） ───
router.post('/auth/login', async (req, res, next) => {
  try {
    const data = await adminService.login(
      req.body.username, req.body.password,
      req.ip, req.headers['user-agent']
    );
    res.json(success(data, '登录成功'));
  } catch (err) { next(err); }
});

// ─── 以下接口需要管理员认证 ───
router.use(adminAuth);

router.get('/auth/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getProfile(req.user!.userId);
    res.json(success(data));
  } catch (err) { next(err); }
});

router.put('/auth/password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
    res.json(success(null, '密码已修改'));
  } catch (err) { next(err); }
});

// ─── 仪表盘 ───
router.get('/dashboard', async (_req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    res.json(success(data));
  } catch (err) { next(err); }
});

// ─── 用户管理 ───
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listUsers({
      phone: req.query.phone as string,
      role: req.query.role as string,
      status: req.query.status as string,
      qualification: req.query.qualification as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
    });
    res.json(success(data));
  } catch (err) { next(err); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const data = await adminService.getUserDetail(parseInt(req.params.id));
    res.json(success(data));
  } catch (err) { next(err); }
});

router.put('/users/:id/status', async (req, res, next) => {
  try {
    const data = await adminService.toggleUserStatus(parseInt(req.params.id));
    res.json(success(data, '状态已更新'));
  } catch (err) { next(err); }
});

// 资质审核
router.post('/users/:id/approve-qualification', async (req, res, next) => {
  try {
    await adminService.approveQualification(parseInt(req.params.id));
    res.json(success(null, '资质已通过'));
  } catch (err) { next(err); }
});

router.post('/users/:id/reject-qualification', async (req, res, next) => {
  try {
    await adminService.rejectQualification(parseInt(req.params.id), req.body.remark || '');
    res.json(success(null, '已驳回'));
  } catch (err) { next(err); }
});

// ─── 订单管理 ───
router.get('/orders', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listOrders({
      status: req.query.status as string,
      orderNo: req.query.orderNo as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
    });
    res.json(success(data));
  } catch (err) { next(err); }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    await adminService.forceOrderStatus(parseInt(req.params.id), req.body.status);
    res.json(success(null, '状态已变更'));
  } catch (err) { next(err); }
});

// ─── 押金管理 ───
router.get('/deposits', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getDeposits(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.pageSize as string) || 20
    );
    res.json(success(data));
  } catch (err) { next(err); }
});

router.put('/deposits/config', async (req, res, next) => {
  try {
    await adminService.setConfig('deposit_amount', req.body.amount || '100');
    res.json(success(null, '押金金额已更新'));
  } catch (err) { next(err); }
});

router.post('/deposits/:id/forfeit', async (req, res, next) => {
  try {
    await adminService.forfeitDeposit(parseInt(req.params.id));
    res.json(success(null, '押金已罚没'));
  } catch (err) { next(err); }
});

// ─── 申诉仲裁 ───
router.get('/disputes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listDisputes(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.pageSize as string) || 20
    );
    res.json(success(data));
  } catch (err) { next(err); }
});

router.put('/disputes/:id/resolve', async (req, res, next) => {
  try {
    await adminService.resolveDispute(parseInt(req.params.id), req.body.resolution || '');
    res.json(success(null, '申诉已处理'));
  } catch (err) { next(err); }
});

// ─── 反馈管理 ───
router.get('/feedbacks', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listFeedbacks(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.pageSize as string) || 20
    );
    res.json(success(data));
  } catch (err) { next(err); }
});

router.put('/feedbacks/:id', async (req, res, next) => {
  try {
    const data = await adminService.updateFeedback(parseInt(req.params.id), req.body.status, req.body.remark);
    res.json(success(data, '状态已更新'));
  } catch (err) { next(err); }
});

// ─── 系统配置 ───
router.get('/config/:key', async (req, res, next) => {
  try {
    const value = await adminService.getConfig(req.params.key);
    res.json(success({ value }));
  } catch (err) { next(err); }
});

router.put('/config/:key', async (req, res, next) => {
  try {
    await adminService.setConfig(req.params.key, req.body.value || '');
    res.json(success(null, '配置已保存'));
  } catch (err) { next(err); }
});

export default router;
