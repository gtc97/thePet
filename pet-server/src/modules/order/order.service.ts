import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { pushOrderUpdate } from '../../utils/push';

// 生成订单号：YYYYMMDD + 6位随机
function generateOrderNo(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${date}${rand}`;
}

export class OrderService {
  // 创建订单（宠主）
  async create(ownerId: number, data: {
    petIds: number[]; serviceType: string; address: string;
    latitude?: number; longitude?: number;
    scheduledDate: string; timeSlot: string; price: number; ownerNote?: string;
  }) {
    // 验证宠物归属且未封存
    for (const petId of data.petIds) {
      const pet = await prisma.pet.findUnique({ where: { id: petId } });
      if (!pet) throw new AppError(404, `宠物 #${petId} 不存在`);
      if (pet.ownerId !== ownerId) throw new AppError(403, `无权选择宠物 #${petId}`);
      if (pet.isArchived) throw new AppError(400, `宠物「${pet.name}」已封存，无法下单`);
    }

    const orderNo = generateOrderNo();

    const order = await prisma.serviceOrder.create({
      data: {
        orderNo,
        ownerId,
        petIds: data.petIds as unknown as object,
        serviceType: data.serviceType,
        address: data.address,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        scheduledDate: new Date(data.scheduledDate),
        timeSlot: data.timeSlot,
        price: data.price,
        ownerNote: data.ownerNote || '',
        status: 'PENDING',
      },
    });

    // 记录状态日志
    await prisma.orderStatusLog.create({
      data: { orderId: order.id, toStatus: 'PENDING', remark: '订单已创建，等待师傅接单' },
    });

    return order;
  }

  // 师傅接单
  async accept(orderId: number, providerId: number) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'PENDING') throw new AppError(400, '订单状态不允许接单');
    if (order.ownerId === providerId) throw new AppError(400, '不能接自己的订单');

    // 检查师傅是否被宠主拉黑
    const blocked = await prisma.blacklist.findFirst({
      where: { userId: order.ownerId, blockedUserId: providerId },
    });
    if (blocked) throw new AppError(400, '对方已将你拉黑，无法接单');

    // 检查押金是否已缴
    const deposit = await prisma.deposit.findFirst({
      where: { userId: providerId, status: 'PAID' },
    });
    if (!deposit) throw new AppError(400, '请先缴纳押金后再接单');

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { providerId, status: 'ACCEPTED' },
    });

    // 冻结押金
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: { status: 'FROZEN', orderId },
    });
    await prisma.depositLog.create({
      data: { depositId: deposit.id, action: 'freeze', amount: deposit.amount, remark: `接单冻结 — 订单#${order.orderNo}` },
    });

    // 创建聊天室
    await prisma.chatRoom.create({
      data: { orderId, userId1: order.ownerId, userId2: providerId },
    });

    // 记录状态日志
    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'PENDING', toStatus: 'ACCEPTED', operatorId: providerId, remark: '师傅已接单' },
    });

    // 推送通知给宠主
    await pushOrderUpdate(orderId, order.ownerId, providerId, '师傅已接单', `订单#${order.orderNo}已被接单`);

    return updated;
  }

  // 拒绝接单
  async reject(orderId: number, providerId: number, reason: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'PENDING') throw new AppError(400, '该订单已无法接单');

    // TODO: 推送通知给宠主 — 「师傅已拒绝，原因：xxx」
    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'PENDING', toStatus: 'PENDING', operatorId: providerId, remark: `师傅拒绝：${reason}` },
    });

    return { message: '已拒绝' };
  }

  // 开始服务
  async startService(orderId: number, providerId: number) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'ACCEPTED') throw new AppError(400, '订单状态不允许开始服务');
    if (order.providerId !== providerId) throw new AppError(403, '无权操作');

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS', serviceStartAt: new Date() },
    });

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'ACCEPTED', toStatus: 'IN_PROGRESS', operatorId: providerId, remark: '服务已开始' },
    });

    await pushOrderUpdate(orderId, order.ownerId, providerId, '服务已开始', `师傅已到达并开始服务`);

    return updated;
  }

  // 完成服务
  async completeService(orderId: number, providerId: number, data: {
    resultImages?: string[]; summary?: string;
  }) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'IN_PROGRESS') throw new AppError(400, '服务尚未开始或已结束');
    if (order.providerId !== providerId) throw new AppError(403, '无权操作');

    const endAt = new Date();
    const duration = order.serviceStartAt
      ? Math.floor((endAt.getTime() - order.serviceStartAt.getTime()) / 1000)
      : 0;

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        serviceEndAt: endAt,
        serviceDuration: duration,
        providerNote: data.summary || '',
      },
    });

    // 服务成果图片自动存入宠物相册
    if (data.resultImages && data.resultImages.length > 0) {
      const petIds = order.petIds as number[];
      for (const petId of petIds) {
        await prisma.petPhoto.createMany({
          data: data.resultImages.map(url => ({
            petId, url, thumbnailUrl: url,
            type: 'IMAGE' as const, sourceType: 'service',
          })),
        });
      }
    }

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', operatorId: providerId, remark: `服务完成，耗时${Math.floor(duration/60)}分钟` },
    });

    await pushOrderUpdate(orderId, order.ownerId, providerId, '服务已完成', '请查看服务成果并验收评价');

    return updated;
  }

  // 取消订单
  async cancel(orderId: number, userId: number, reason: string) {
    const order = await this.getOrderOrFail(orderId);
    if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
      throw new AppError(400, '当前状态不可取消');
    }
    if (order.ownerId !== userId && order.providerId !== userId) {
      throw new AppError(403, '无权操作');
    }

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelReason: reason, cancelBy: userId },
    });

    // 解冻押金
    if (order.status === 'ACCEPTED') {
      const deposit = await prisma.deposit.findFirst({ where: { orderId, status: 'FROZEN' } });
      if (deposit) {
        await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'PAID', orderId: null } });
        await prisma.depositLog.create({ data: { depositId: deposit.id, action: 'unfreeze', amount: deposit.amount, remark: `订单取消解冻 — 订单#${order.orderNo}` } });
      }
    }

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: order.status, toStatus: 'CANCELLED', operatorId: userId, remark: `取消原因：${reason}` },
    });

    const notifyId = userId === order.ownerId ? order.providerId : order.ownerId;
    if (notifyId) await pushOrderUpdate(orderId, notifyId, null, '订单已取消', `原因：${reason}`);

    return updated;
  }

  // 我的订单列表（按身份区分）
  async listMyOrders(userId: number, role: string, status?: string, page = 1, pageSize = 20) {
    const where: Record<string, unknown> = {};
    if (role === 'PET_OWNER') {
      where.ownerId = userId;
    } else if (role === 'SERVICE_PROVIDER') {
      where.providerId = userId;
    }
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          owner: { select: { id: true, nickname: true, avatar: true } },
          provider: { select: { id: true, nickname: true, avatar: true, avgRating: true } },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 订单详情
  async getDetail(orderId: number) {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        owner: { select: { id: true, nickname: true, avatar: true, phone: true } },
        provider: { select: { id: true, nickname: true, avatar: true, phone: true, avgRating: true, totalOrders: true } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
        reviews: true,
      },
    });
    if (!order) throw new AppError(404, '订单不存在');
    return order;
  }

  // 订单状态时间线
  async getTimeline(orderId: number) {
    return prisma.orderStatusLog.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 附近可接订单（师傅视角）
  async listNearby(providerId: number, page = 1, pageSize = 20) {
    // 检查师傅是否在宠主黑名单中
    const blockerIds = await prisma.blacklist.findMany({
      where: { blockedUserId: providerId },
      select: { userId: true },
    });
    const excludeOwnerIds = blockerIds.map(b => b.userId);

    const where: Record<string, unknown> = {
      status: 'PENDING',
      ownerId: { notIn: excludeOwnerIds },
    };

    const [list, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          owner: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  private async getOrderOrFail(orderId: number) {
    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    return order;
  }
}

export const orderService = new OrderService();
