import prisma from '../../config/database';

// 预警检测服务
export class WarningService {
  // 综合检测：异常订单
  async checkAbnormalOrders() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 检测高频取消订单的用户
    const cancelledOrders = await prisma.serviceOrder.groupBy({
      by: ['ownerId'],
      where: { status: 'CANCELLED', updatedAt: { gte: weekAgo } },
      _count: { id: true },
      having: { id: { _count: { gte: 3 } } },
    });

    for (const item of cancelledOrders) {
      const user = await prisma.user.findUnique({ where: { id: item.ownerId } });
      await this.createWarning('abnormal_order', 'warn',
        '高频取消订单',
        `用户「${user?.nickname || item.ownerId}」近7天取消${item._count.id}笔订单`,
        item.ownerId,
      );
    }

    // 检测低分评价集中
    const lowRatings = await prisma.review.groupBy({
      by: ['revieweeId'],
      where: { rating: { lte: 2 }, createdAt: { gte: weekAgo } },
      _count: { id: true },
      having: { id: { _count: { gte: 3 } } },
    });

    for (const item of lowRatings) {
      const user = await prisma.user.findUnique({ where: { id: item.revieweeId } });
      await this.createWarning('review_surge', 'alert',
        '差评集中预警',
        `宠护师「${user?.nickname || item.revieweeId}」近7天收到${item._count.id}条低分评价`,
        item.revieweeId,
      );
    }

    // 检测投诉激增
    const recentDisputes = await prisma.dispute.groupBy({
      by: ['initiatorId'],
      where: { createdAt: { gte: weekAgo } },
      _count: { id: true },
      having: { id: { _count: { gte: 2 } } },
    });

    for (const item of recentDisputes) {
      const user = await prisma.user.findUnique({ where: { id: item.initiatorId } });
      await this.createWarning('complaint_surge', 'warn',
        '投诉频繁提醒',
        `用户「${user?.nickname || item.initiatorId}」近7天发起${item._count.id}次投诉`,
        item.initiatorId,
      );
    }

    return { ok: true };
  }

  // 获取预警列表
  async listWarnings(page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      prisma.warningLog.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warningLog.count(),
    ]);
    return { list, total, page, pageSize };
  }

  // 标记已处理
  async markHandled(warningId: number) {
    return prisma.warningLog.update({
      where: { id: warningId },
      data: { handled: true },
    });
  }

  // 创建预警（去重：同类型+同关联ID+当天已有则不重复）
  private async createWarning(type: string, level: string, title: string, content: string, relatedId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.warningLog.findFirst({
      where: { type, relatedId, createdAt: { gte: today } },
    });
    if (!existing) {
      await prisma.warningLog.create({ data: { type, level, title, content, relatedId } });
    }
  }
}

export const warningService = new WarningService();
