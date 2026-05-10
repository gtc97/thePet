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
  // 创建订单（宠主指定宠护师）
  async create(ownerId: number, data: {
    petIds: number[]; serviceType: string; address: string;
    latitude?: number; longitude?: number;
    scheduledDate: string; timeSlot: string; price: number; ownerNote?: string;
    providerId?: number;
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
        providerId: data.providerId || null,
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
    const remark = data.providerId ? '订单已创建，已指定宠护师' : '订单已创建，等待宠护师接单';
    await prisma.orderStatusLog.create({
      data: { orderId: order.id, toStatus: 'PENDING', remark },
    });

    // 如果指定了宠护师，推送通知
    if (data.providerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { nickname: true } });
      await pushOrderUpdate(order.id, data.providerId, null, '新订单', `「${owner?.nickname}」向您发来新订单`);
    }

    return order;
  }

  // 宠护师接单
  async accept(orderId: number, providerId: number) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'PENDING') throw new AppError(400, '订单状态不允许接单');
    if (order.ownerId === providerId) throw new AppError(400, '不能接自己的订单');

    // 检查宠护师是否被宠主拉黑
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
      data: { orderId, fromStatus: 'PENDING', toStatus: 'ACCEPTED', operatorId: providerId, remark: '宠护师已接单' },
    });

    // 推送通知给宠主
    await pushOrderUpdate(orderId, order.ownerId, providerId, '宠护师已接单', `订单#${order.orderNo}已被接单`);

    return updated;
  }

  // 宠护师拒单/取消申请
  async reject(orderId: number, providerId: number, reason: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'PENDING') throw new AppError(400, '该订单已无法接单');

    // 如果是指定给该宠护师的订单，清空指定，变为开放订单
    if (order.providerId === providerId) {
      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { providerId: null },
      });
      await prisma.orderStatusLog.create({
        data: { orderId, fromStatus: 'PENDING', toStatus: 'PENDING', operatorId: providerId, remark: `指定的宠护师拒绝：${reason}，订单已开放` },
      });
      // 通知宠主
      const provider = await prisma.user.findUnique({ where: { id: providerId }, select: { nickname: true } });
      await pushOrderUpdate(orderId, order.ownerId, null, '宠护师拒绝了订单', `「${provider?.nickname}」拒绝了您的订单，订单已变为公开，其他宠护师可申请`);
      return { message: '已拒绝，订单已开放' };
    }

    // 如果是申请中的宠护师，取消申请
    const applicants = (order.applicants as any[]) || [];
    if (applicants.some(a => a.providerId === providerId)) {
      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { applicants: applicants.filter(a => a.providerId !== providerId) as any },
      });
      await prisma.orderStatusLog.create({
        data: { orderId, fromStatus: 'PENDING', toStatus: 'PENDING', operatorId: providerId, remark: `申请人取消申请：${reason}` },
      });
      return { message: '已取消申请' };
    }

    // 其他情况：记录日志
    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'PENDING', toStatus: 'PENDING', operatorId: providerId, remark: `拒绝：${reason}` },
    });
    return { message: '已拒绝' };
  }

  // 宠主确认付款（上传微信支付凭证）
  async payOrder(orderId: number, userId: number, paymentProof?: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.ownerId !== userId) throw new AppError(403, '无权操作');
    if (order.status !== 'ACCEPTED') throw new AppError(400, '当前状态不可付款');

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { status: 'PAID', paymentStatus: 'PAID', paymentProof: paymentProof || null },
    });

    // 冻结宠护师押金
    if (order.providerId) {
      const deposit = await prisma.deposit.findFirst({
        where: { userId: order.providerId, status: 'PAID' },
      });
      if (deposit) {
        await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'FROZEN', orderId } });
        await prisma.depositLog.create({
          data: { depositId: deposit.id, action: 'freeze', amount: deposit.amount, remark: `订单#${order.orderNo}宠主已付款` },
        });
      }
    }

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'ACCEPTED', toStatus: 'PAID', operatorId: userId, remark: '宠主已付款' },
    });

    if (order.providerId) {
      await pushOrderUpdate(orderId, order.providerId, userId, '宠主已付款', '请尽快开始服务');
    }

    return updated;
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

    await pushOrderUpdate(orderId, order.ownerId, providerId, '服务已开始', `宠护师已到达并开始服务`);

    return updated;
  }

  // 宠护师完成服务（直接完成）
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
        completedAt: endAt,
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

    // 积分激励
    if (order.providerId) {
      await this.addPoints(order.providerId, 10);
      await this.updateProviderLevel(order.providerId);
    }

    // 自动生成服务记录日记
    const petIds = order.petIds as number[];
    for (const petId of petIds) {
      await prisma.petDiary.create({
        data: {
          petId,
          title: `服务记录：${order.serviceType}`,
          content: `宠护师完成${order.serviceType}服务${data.summary ? '：' + data.summary : ''}`,
          images: data.resultImages || [],
        },
      });
    }

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', operatorId: providerId, remark: `服务完成，耗时${Math.floor(duration/60)}分钟` },
    });

    await pushOrderUpdate(orderId, order.ownerId, providerId, '服务已完成', '请查看服务成果并评价');

    return updated;
  }

  // 宠主确认验收（结单，解冻押金）
  async confirmOrder(orderId: number, userId: number) {
    const order = await this.getOrderOrFail(orderId);
    if (order.ownerId !== userId) throw new AppError(403, '无权操作');
    if (order.status !== 'WAITING_CONFIRM') throw new AppError(400, '当前状态不可确认');

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        ownerConfirmedAt: new Date(),
      },
    });

    // 解冻宠护师押金
    if (order.providerId) {
      const deposit = await prisma.deposit.findFirst({
        where: { userId: order.providerId, orderId, status: 'FROZEN' },
      });
      if (deposit) {
        await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'PAID', orderId: null } });
        await prisma.depositLog.create({
          data: { depositId: deposit.id, action: 'unfreeze', amount: deposit.amount, remark: `订单#${order.orderNo}已结算` },
        });
      }
    }

    // 激励积分
    await this.addPoints(userId, 5);    // 确认验收 +5
    if (order.providerId) {
      await this.addPoints(order.providerId, 10); // 完成服务 +10
      await this.updateProviderLevel(order.providerId);
    }

    // 自动生成服务记录日记（记录到每只服务宠物）
    const petIds = order.petIds as number[];
    const provider = order.providerId ? await prisma.user.findUnique({ where: { id: order.providerId }, select: { nickname: true } }) : null;
    for (const petId of petIds) {
      await prisma.petDiary.create({
        data: {
          petId,
          title: `服务记录：${order.serviceType}`,
          content: `宠护师「${provider?.nickname || '已离职'}」完成${order.serviceType}服务${order.providerNote ? '：' + order.providerNote : ''}`,
          images: [],
        },
      });
    }

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'WAITING_CONFIRM', toStatus: 'COMPLETED', operatorId: userId, remark: '宠主已确认，订单完成' },
    });

    if (order.providerId) {
      await pushOrderUpdate(orderId, order.providerId, userId, '订单已结算', '宠主已确认完成，押金已解冻');
    }

    return updated;
  }

  // 积分变动
  private async addPoints(userId: number, amount: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });
  }

  // 更新宠护师等级（基于积分）
  private async updateProviderLevel(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const total = user.points || 0;
    const level = total >= 500 ? 5 : total >= 200 ? 4 : total >= 100 ? 3 : total >= 50 ? 2 : total >= 10 ? 1 : 0;
    if (level !== (user.level || 0)) {
      await prisma.user.update({ where: { id: userId }, data: { level } });
    }
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

  // 附近可接订单（宠护师视角）
  async listNearby(providerId: number, page = 1, pageSize = 20) {
    // 检查宠护师是否在宠主黑名单中
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

  // 宠护师申请接单
  async applyOrder(orderId: number, providerId: number) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'PENDING') throw new AppError(400, '订单状态不允许申请');
    if (order.providerId) throw new AppError(400, '该订单已指定宠护师');
    if (order.ownerId === providerId) throw new AppError(400, '不能申请自己的订单');

    // 检查宠护师是否被宠主拉黑
    const blocked = await prisma.blacklist.findFirst({
      where: { userId: order.ownerId, blockedUserId: providerId },
    });
    if (blocked) throw new AppError(400, '对方已将你拉黑');

    // 检查押金
    const deposit = await prisma.deposit.findFirst({
      where: { userId: providerId, status: 'PAID' },
    });
    if (!deposit) throw new AppError(400, '请先缴纳押金后再申请接单');

    const provider = await prisma.user.findUnique({ where: { id: providerId }, select: { nickname: true, avatar: true, avgRating: true } });
    const applicants = (order.applicants as any[]) || [];

    // 检查是否已申请
    if (applicants.some(a => a.providerId === providerId)) {
      throw new AppError(400, '已申请，请等待宠主确认');
    }

    applicants.push({
      providerId,
      nickname: provider?.nickname || '',
      avatar: provider?.avatar || '',
      avgRating: provider?.avgRating || 0,
      appliedAt: new Date().toISOString(),
    });

    await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { applicants: applicants as any },
    });

    // 通知宠主
    await pushOrderUpdate(orderId, order.ownerId, providerId, '有人申请接单', `「${provider?.nickname}」申请接单，请查看`);
  }

  // 宠主选择宠护师
  async selectProvider(orderId: number, ownerId: number, providerId: number) {
    const order = await this.getOrderOrFail(orderId);
    if (order.ownerId !== ownerId) throw new AppError(403, '无权操作');
    if (order.status !== 'PENDING') throw new AppError(400, '当前状态不可选择');
    if (order.providerId) throw new AppError(400, '已选择宠护师');

    const applicants = (order.applicants as any[]) || [];
    const selected = applicants.find(a => a.providerId === providerId);
    if (!selected) throw new AppError(400, '该宠护师未申请');

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        providerId,
        status: 'ACCEPTED',
        applicants: [] as any, // 清空申请列表
      },
    });

    // 冻结宠护师押金
    const deposit = await prisma.deposit.findFirst({ where: { userId: providerId, status: 'PAID' } });
    if (deposit) {
      await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'FROZEN', orderId } });
      await prisma.depositLog.create({
        data: { depositId: deposit.id, action: 'freeze', amount: deposit.amount, remark: `接单冻结 — 订单#${order.orderNo}` },
      });
    }

    // 创建聊天室
    await prisma.chatRoom.create({
      data: { orderId, userId1: order.ownerId, userId2: providerId },
    });

    await prisma.orderStatusLog.create({
      data: { orderId, fromStatus: 'PENDING', toStatus: 'ACCEPTED', operatorId: ownerId, remark: `宠主选择了「${selected.nickname}」` },
    });

    await pushOrderUpdate(orderId, providerId, ownerId, '已入选', '宠主已选择你，请尽快联系确认');

    return updated;
  }

  // 取消申请
  async cancelApply(orderId: number, providerId: number) {
    const order = await this.getOrderOrFail(orderId);
    const applicants = (order.applicants as any[]) || [];
    const filtered = applicants.filter(a => a.providerId !== providerId);
    await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { applicants: filtered as any },
    });
  }

  private async getOrderOrFail(orderId: number) {
    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    return order;
  }
}

export const orderService = new OrderService();
