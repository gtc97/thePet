import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../utils/jwt';

interface ChatSocket extends WebSocket {
  userId?: number;
  chatRoom?: number;
}

let wss: WebSocketServer | null = null;

// 启动WebSocket服务
export function initSocket(httpServer: HttpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: ChatSocket, req) => {
    // 从URL参数中提取token
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (!token) {
      ws.close(4001, '未登录');
      return;
    }

    try {
      const payload = verifyToken(token);
      ws.userId = payload.userId;
    } catch {
      ws.close(4001, 'Token无效');
      return;
    }

    console.log(`[WS] 用户${ws.userId}已连接`);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'join-room' && msg.roomId) {
          ws.chatRoom = msg.roomId;
        }
      } catch { /* ignore */ }
    });

    ws.on('close', () => {
      console.log(`[WS] 用户${ws.userId}已断开`);
    });
  });

  console.log('[WebSocket] 已启动');
}

// 向聊天室广播新消息
export function sendToRoom(roomId: number, data: any) {
  if (!wss) return;
  wss.clients.forEach((ws: ChatSocket) => {
    if (ws.chatRoom === roomId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

// 向指定用户推送
export function sendToUser(userId: number, data: any) {
  if (!wss) return;
  wss.clients.forEach((ws: ChatSocket) => {
    if (ws.userId === userId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}
