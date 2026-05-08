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
import orderRoutes from './modules/order/order.routes';
import depositRoutes from './modules/deposit/deposit.routes';
import reviewRoutes from './modules/review/review.routes';
import disputeRoutes from './modules/dispute/dispute.routes';
import blacklistRoutes from './modules/blacklist/blacklist.routes';
import chatRoutes from './modules/chat/chat.routes';
import notificationRoutes from './modules/notification/notification.routes';
import adminRoutes from './modules/admin/admin.routes';
import mapRoutes from './modules/map/map.routes';
import feedbackRoutes from './modules/feedback/feedback.routes';

const app = express();

// ─── 全局中间件 ───────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传资源）
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// ─── API路由注册 ──────────────────────────────────

app.use('/api/v1/auth', authRoutes);               // 认证
app.use('/api/v1/users', userRoutes);              // 用户
app.use('/api/v1/upload', uploadRoutes);           // 上传
app.use('/api/v1/pets', petRoutes);                // 宠物档案
app.use('/api/v1/pets/:petId/albums', albumRoutes);  // 相册
app.use('/api/v1/pets/:petId/photos', photoRoutes);  // 照片
app.use('/api/v1/pets/:petId/diaries', diaryRoutes); // 日记
app.use('/api/v1/shares', shareRoutes);            // 分享
app.use('/api/v1/favorites', favoriteRoutes);      // 收藏
app.use('/api/v1/orders', orderRoutes);            // 订单
app.use('/api/v1/deposits', depositRoutes);        // 押金
app.use('/api/v1', reviewRoutes);                  // 评价（嵌套路由）
app.use('/api/v1', disputeRoutes);                 // 申诉（嵌套路由）
app.use('/api/v1/blacklist', blacklistRoutes);     // 黑名单
app.use('/api/v1/chat', chatRoutes);               // 聊天
app.use('/api/v1/notifications', notificationRoutes); // 通知
app.use('/api/v1/admin', adminRoutes);              // 管理端
app.use('/api/v1/map', mapRoutes);                  // 地图
app.use('/api/v1/feedback', feedbackRoutes);         // 反馈

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 统一错误处理 ──────────────────────────────────
app.use(errorHandler);

export default app;
