import { request } from './request';

// 获取/创建聊天室
export function getChatRoom(orderId) {
  return request({ url: `/chat/rooms/${orderId}`, method: 'GET' });
}

// 聊天室列表
export function getChatRooms() {
  return request({ url: '/chat/rooms', method: 'GET' });
}

// 消息记录
export function getMessages(roomId, page = 1) {
  return request({ url: `/chat/rooms/${roomId}/messages?page=${page}`, method: 'GET' });
}

// 发送消息
export function sendMessage(roomId, content, type = 'text') {
  return request({ url: `/chat/rooms/${roomId}/messages`, method: 'POST', data: { content, type } });
}
