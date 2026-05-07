import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// 导入各模块路由
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import uploadRoutes from './modules/upload/upload.routes';
import petRoutes from './modules/pet/pet.routes';
import albumRoutes from './modules/album/album.routes';
import photoRoutes from './modules/album/photo.routes';
import diaryRoutes from './modules/diary/diary.routes';
import shareRoutes from './modules/share/share.routes';
import favoriteRoutes from './modules/favorite/favorite.routes';

const app = express();

// ─── 全局中间件 ───────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传资源）
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// ─── API路由注册 ──────────────────────────────────

// 认证模块
app.use('/api/v1/auth', authRoutes);

// 用户模块
app.use('/api/v1/users', userRoutes);

// 上传模块
app.use('/api/v1/upload', uploadRoutes);

// 宠物档案模块
app.use('/api/v1/pets', petRoutes);

// 相册模块（嵌套路由：/pets/:petId/albums）
app.use('/api/v1/pets/:petId/albums', albumRoutes);

// 照片模块（嵌套路由：/pets/:petId/photos）
app.use('/api/v1/pets/:petId/photos', photoRoutes);

// 日记模块（嵌套路由：/pets/:petId/diaries）
app.use('/api/v1/pets/:petId/diaries', diaryRoutes);

// 分享模块
app.use('/api/v1/shares', shareRoutes);

// 收藏模块
app.use('/api/v1/favorites', favoriteRoutes);

// 订单模块（阶段3实现，占位）
app.use('/api/v1/orders', (_req, res) => {
  res.json({ code: 0, message: 'Order module — Phase 3', data: [] });
});

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 统一错误处理 ──────────────────────────────────
app.use(errorHandler);

export default app;
