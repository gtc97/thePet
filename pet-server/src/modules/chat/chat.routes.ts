import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest, success } from '../../types';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// 获取或创建订单对应的聊天室
router.get('/rooms/:orderId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) throw new AppError(400, '参数错误：订单ID无效');
    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.ownerId !== req.user!.userId && order.providerId !== req.user!.userId) {
      throw new AppError(403, '无权访问');
    }

    let room = await prisma.chatRoom.findUnique({ where: { orderId } });
    if (!room) {
      room = await prisma.chatRoom.create({
        data: { orderId, userId1: order.ownerId, userId2: order.providerId! },
      });
    }

    res.json(success(room));
  } catch (err) { next(err); }
});

// 我的聊天室列表
router.get('/rooms', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [{ userId1: req.user!.userId }, { userId2: req.user!.userId }],
      },
      include: {
        order: { select: { orderNo: true, status: true } },
        user1: { select: { id: true, nickname: true, avatar: true } },
        user2: { select: { id: true, nickname: true, avatar: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(success(rooms));
  } catch (err) { next(err); }
});

// 获取消息记录
router.get('/rooms/:roomId/messages', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;

    const [list, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { sender: { select: { id: true, nickname: true, avatar: true } } },
      }),
      prisma.chatMessage.count({ where: { roomId } }),
    ]);

    // 标记已读
    await prisma.chatMessage.updateMany({
      where: { roomId, senderId: { not: req.user!.userId }, isRead: false },
      data: { isRead: true },
    });

    res.json(success({ list: list.reverse(), total, page, pageSize }));
  } catch (err) { next(err); }
});

// 发送消息（REST降级方案）
router.post('/rooms/:roomId/messages', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError(404, '聊天室不存在');
    if (room.userId1 !== req.user!.userId && room.userId2 !== req.user!.userId) {
      throw new AppError(403, '无权操作');
    }

    // 检查聊天是否在有效期内（订单完成7天内）
    const order = await prisma.serviceOrder.findUnique({ where: { id: room.orderId } });
    if (!order) throw new AppError(404, '订单不存在');
    const isChatValid = ['ACCEPTED', 'IN_PROGRESS'].includes(order.status) ||
      (order.status === 'COMPLETED' && order.completedAt &&
       Date.now() - order.completedAt.getTime() < 7 * 24 * 60 * 60 * 1000);
    if (!isChatValid) throw new AppError(400, '聊天已关闭');

    // 检查用户是否关闭私信
    const receiverId = room.userId1 === req.user!.userId ? room.userId2 : room.userId1;
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (receiver?.chatDisabled) throw new AppError(400, '对方已关闭私信');

    // 敏感词简单过滤
    const sensitiveWords = ['微信', '手机号', '电话', 'QQ', '加我'];
    let content = req.body.content;
    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        content = content.replace(word, '***');
      }
    }

    const msg = await prisma.chatMessage.create({
      data: { roomId, senderId: req.user!.userId, content, type: req.body.type || 'text' },
    });

    await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

    res.json(success(msg, '发送成功'));
  } catch (err) { next(err); }
});

export default router;
