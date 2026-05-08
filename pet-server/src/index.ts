import app from './app';
import { config } from './config';
import { connectRedis } from './config/redis';
import prisma from './config/database';
import { adminService } from './modules/admin/admin.service';

async function bootstrap() {
  // Verify database connection
  try {
    await prisma.$connect();
    console.log('[Database] Connected');
  } catch (err) {
    console.error('[Database] Connection failed:', (err as Error).message);
    process.exit(1);
  }

  // 初始化默认管理员（首次运行自动创建）
  await adminService.seedAdmin();

  // Connect Redis (non-blocking)
  await connectRedis();

  // Start server
  app.listen(config.port, () => {
    console.log(`[Server] Running at http://localhost:${config.port}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
