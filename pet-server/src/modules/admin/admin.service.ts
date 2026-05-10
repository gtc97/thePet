import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { signToken } from '../../utils/jwt';

export class AdminService {
  // 管理员登录
  async login(username: string, password: string, ip?: string, userAgent?: string) {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new AppError(401, '用户名或密码错误');

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new AppError(401, '用户名或密码错误');

    // 记录登录日志
    await prisma.adminLoginLog.create({
      data: { adminId: admin.id, ip: ip || '', userAgent: userAgent || '' },
    });

    // 管理员Token，roles固定为['ADMIN']
    const token = signToken({ userId: admin.id, roles: ['ADMIN'] });

    return {
      token,
      admin: { id: admin.id, username: admin.username, nickname: admin.nickname, avatar: admin.avatar },
    };
  }

  // 获取管理员信息
  async getProfile(adminId: number) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError(404, '管理员不存在');
    return { id: admin.id, username: admin.username, nickname: admin.nickname, avatar: admin.avatar };
  }

  // 修改密码
  async changePassword(adminId: number, oldPassword: string, newPassword: string) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError(404, '管理员不存在');

    const valid = await bcrypt.compare(oldPassword, admin.password);
    if (!valid) throw new AppError(400, '原密码错误');

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
  }

  // 仪表盘数据
  async getDashboard() {
    const [
      userCount, petCount, orderCount,
      pendingDisputes, pendingQualifications, pendingFeedbacks,
      paidOrders, completedToday, providerCount,
      recentOrders, topProviders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pet.count(),
      prisma.serviceOrder.count(),
      prisma.dispute.count({ where: { status: { in: ['PENDING', 'REVIEWING'] } } }),
      prisma.user.count({ where: { qualificationStatus: 'pending' } }),
      prisma.feedback.count({ where: { status: 'pending' } }),
      prisma.serviceOrder.count({ where: { paymentStatus: 'PAID', status: { not: 'CANCELLED' } } }),
      prisma.serviceOrder.count({ where: { status: 'COMPLETED', updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.user.count({ where: { roles: { path: '$', array_contains: ['SERVICE_PROVIDER'] } } }),
      prisma.serviceOrder.findMany({ take: 5, orderBy: { createdAt: 'desc' },
        include: { owner: { select: { nickname: true } }, provider: { select: { nickname: true } } },
      }),
      prisma.user.findMany({
        where: { roles: { path: '$', array_contains: ['SERVICE_PROVIDER'] } },
        orderBy: { avgRating: 'desc' }, take: 5,
        select: { id: true, nickname: true, avatar: true, avgRating: true, totalOrders: true, level: true },
      }),
    ]);

    return {
      userCount, petCount, orderCount,
      pendingDisputes, pendingQualifications, pendingFeedbacks,
      paidOrders, completedToday, providerCount,
      recentOrders, topProviders,
    };
  }

  // 用户列表
  async listUsers(params: { phone?: string; role?: string; status?: string; qualification?: string; page?: number; pageSize?: number }) {
    const where: Record<string, unknown> = {};
    if (params.phone) where.phone = { contains: params.phone };
    if (params.status) where.status = params.status;
    if (params.qualification) where.qualificationStatus = params.qualification;
    if (params.role === 'SERVICE_PROVIDER') {
      where.roles = { path: '$', array_contains: ['SERVICE_PROVIDER'] };
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, nickname: true, phone: true, avatar: true,
          roles: true, status: true, qualificationStatus: true,
          city: true, points: true, level: true, avgRating: true, totalOrders: true,
          createdAt: true,
          _count: { select: { pets: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 用户详情
  async getUserDetail(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: { select: { id: true, name: true, breed: true, isArchived: true } },
        _count: { select: { ownedOrders: true, providerOrders: true } },
      },
    });
    if (!user) throw new AppError(404, '用户不存在');
    return user;
  }

  // 禁用/解封用户
  async toggleUserStatus(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    return prisma.user.update({ where: { id: userId }, data: { status: newStatus } });
  }

  // 审核资质通过
  async approveQualification(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');
    if (user.qualificationStatus !== 'pending') throw new AppError(400, '当前状态不可操作');

    const roles = [...(user.roles as string[]), 'SERVICE_PROVIDER'];
    await prisma.user.update({
      where: { id: userId },
      data: { qualificationStatus: 'approved', roles: roles as unknown as object },
    });

    // 推送通知
    await prisma.pushLog.create({
      data: { userId, type: 'QUALIFICATION', title: '资质审核通过', content: '您的宠护师资质已通过审核，现在可以切换身份接单了' },
    });
  }

  // 驳回资质
  async rejectQualification(userId: number, remark: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');

    await prisma.user.update({
      where: { id: userId },
      data: { qualificationStatus: 'rejected' },
    });

    await prisma.pushLog.create({
      data: { userId, type: 'QUALIFICATION', title: '资质审核驳回', content: `您的资质申请已被驳回：${remark}` },
    });
  }

  // 全量订单查询
  async listOrders(params: { status?: string; orderNo?: string; phone?: string; page?: number; pageSize?: number }) {
    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    if (params.orderNo) where.orderNo = { contains: params.orderNo };
    if (params.phone) {
      where.OR = [
        { owner: { phone: { contains: params.phone } } },
        { provider: { phone: { contains: params.phone } } },
      ];
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const [list, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, nickname: true, phone: true } },
          provider: { select: { id: true, nickname: true, phone: true } },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 订单详情
  async getOrderDetail(orderId: number) {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        owner: { select: { id: true, nickname: true, phone: true, avatar: true } },
        provider: { select: { id: true, nickname: true, phone: true, avatar: true } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
        reviews: { include: { reviewer: { select: { nickname: true } } } },
        disputes: true,
      },
    });
    if (!order) throw new AppError(404, '订单不存在');
    return order;
  }

  // 强制修改订单状态
  async forceOrderStatus(orderId: number, status: string) {
    await prisma.serviceOrder.update({ where: { id: orderId }, data: { status: status as any } });
    await prisma.orderStatusLog.create({
      data: { orderId, toStatus: status as any, remark: '管理员强制变更' },
    });
  }

  // 押金配置 & 列表
  async getDeposits(page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      prisma.deposit.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true, phone: true } } },
      }),
      prisma.deposit.count(),
    ]);
    return { list, total, page, pageSize };
  }

  async forfeitDeposit(depositId: number) {
    const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new AppError(404, '押金记录不存在');
    if (deposit.status !== 'FROZEN') throw new AppError(400, '仅可罚没冻结中的押金');

    await prisma.deposit.update({ where: { id: depositId }, data: { status: 'FORFEITED' } });
    await prisma.depositLog.create({
      data: { depositId, action: 'forfeit', amount: deposit.amount, remark: '管理员罚没' },
    });
  }

  // 申诉列表 & 处理
  async listDisputes(page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      prisma.dispute.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNo: true } },
          initiator: { select: { id: true, nickname: true } },
        },
      }),
      prisma.dispute.count(),
    ]);
    return { list, total, page, pageSize };
  }

  async resolveDispute(disputeId: number, resolution: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new AppError(404, '申诉不存在');

    await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'RESOLVED', resolution, resolvedAt: new Date() },
    });
    await prisma.serviceOrder.update({ where: { id: dispute.orderId }, data: { status: 'COMPLETED' } });
  }

  // 反馈管理
  async listFeedbacks(page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      prisma.feedback.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true } } },
      }),
      prisma.feedback.count(),
    ]);
    return { list, total, page, pageSize };
  }

  async updateFeedback(feedbackId: number, status: string, remark?: string) {
    return prisma.feedback.update({ where: { id: feedbackId }, data: { status, remark: remark || '' } });
  }

  // ─── 宠物管理 ───
  async listPets(params: { name?: string; ownerPhone?: string; privacy?: string; isArchived?: string; page?: number; pageSize?: number }) {
    const where: Record<string, unknown> = {};
    if (params.name) where.name = { contains: params.name };
    if (params.privacy) where.privacy = params.privacy;
    if (params.isArchived !== undefined) where.isArchived = params.isArchived === 'true';
    if (params.ownerPhone) {
      where.owner = { phone: { contains: params.ownerPhone } };
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const [list, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, nickname: true, phone: true } },
          _count: { select: { photos: true, diaries: true, albums: true } },
        },
      }),
      prisma.pet.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 宠物详情
  async getPetDetail(petId: number) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: { select: { id: true, nickname: true, phone: true, avatar: true } },
        photos: { take: 10, orderBy: { createdAt: 'desc' } },
        diaries: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, createdAt: true } },
        _count: { select: { photos: true, diaries: true, albums: true, shares: true } },
      },
    });
    if (!pet) throw new AppError(404, '宠物不存在');
    return pet;
  }

  // 管理员编辑宠物（审核/隐藏/归档）
  async updatePet(petId: number, data: { name?: string; privacy?: string; isArchived?: boolean }) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.privacy !== undefined) updateData.privacy = data.privacy;
    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
      updateData.archivedAt = data.isArchived ? new Date() : null;
    }
    return prisma.pet.update({ where: { id: petId }, data: updateData });
  }

  // 系统配置
  async getConfig(key: string) {
    const cfg = await prisma.systemConfig.findUnique({ where: { key } });
    return cfg?.value || null;
  }

  async setConfig(key: string, value: string) {
    return prisma.systemConfig.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // 初始化默认管理员（首次运行）
  async seedAdmin() {
    const existing = await prisma.admin.findFirst();
    if (!existing) {
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: await bcrypt.hash('admin123', 10),
          nickname: '超级管理员',
        },
      });
      console.log('[Admin] 已创建默认管理员: admin / admin123');
    }
  }
}

export const adminService = new AdminService();
