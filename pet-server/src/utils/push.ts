import prisma from '../config/database';

// 推送通知类型
type PushType = 'SYSTEM' | 'ORDER' | 'CHAT' | 'REVIEW' | 'DISPUTE' | 'QUALIFICATION';

// 统一推送服务（当前为DB记录方式，可扩展为微信模板消息/App Push）
export async function sendPush(
  userId: number,
  type: PushType,
  title: string,
  content: string,
  relatedId?: number
): Promise<void> {
  try {
    await prisma.pushLog.create({
      data: { userId, type, title, content, relatedId },
    });
    // TODO: 对接微信小程序订阅消息 / App Push 推送通道
  } catch (err) {
    console.error('[Push] Failed:', (err as Error).message);
  }
}

// 订单状态变更推送
export async function pushOrderUpdate(
  orderId: number,
  ownerId: number,
  providerId: number | null,
  title: string,
  content: string
): Promise<void> {
  // 推送给宠主
  await sendPush(ownerId, 'ORDER', title, content, orderId);
  // 推送给师傅（如果有）
  if (providerId) {
    await sendPush(providerId, 'ORDER', title, content, orderId);
  }
}

// 评价推送
export async function pushReview(userId: number, content: string, orderId: number): Promise<void> {
  await sendPush(userId, 'REVIEW', '新评价', content, orderId);
}

// 申诉推送（推送给对方）
export async function pushDispute(userId: number, content: string, orderId: number): Promise<void> {
  await sendPush(userId, 'DISPUTE', '订单申诉', content, orderId);
}

// 聊天新消息推送
export async function pushChatMessage(userId: number, fromName: string, orderId: number): Promise<void> {
  await sendPush(userId, 'CHAT', '新消息', `${fromName}发来一条消息`, orderId);
}
