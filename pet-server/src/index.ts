import http from 'http';
import app from './app';
import { config } from './config';
import { connectRedis } from './config/redis';
import prisma from './config/database';
import { adminService } from './modules/admin/admin.service';
import { initSocket } from './config/socket';

async function bootstrap() {
  // 验证数据库连接
  try {
    await prisma.$connect();
    console.log('[Database] Connected');
  } catch (err) {
    console.error('[Database] Connection failed:', (err as Error).message);
    process.exit(1);
  }

  // 初始化默认管理员
  await adminService.seedAdmin();

  // 连接Redis（非阻塞）
  await connectRedis();

  // 创建HTTP Server
  const server = http.createServer(app);

  // 挂载Socket.IO
  initSocket(server);

  // 启动服务
  server.listen(config.port, () => {
    console.log(`[Server] Running at http://localhost:${config.port}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch(console.error);

// 优雅退出
process.on('SIGTERM', async () => {
  console.log('[Server] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
