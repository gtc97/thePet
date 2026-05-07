import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// ─── Global middleware ───────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving (uploads)
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// ─── API Routes ──────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Module routes (stubs for Phase 1, full implementation Phase 2-3)
app.use('/api/v1/pets', (_req, res) => {
  res.json({ code: 0, message: 'Pet module — Phase 2', data: [] });
});
app.use('/api/v1/orders', (_req, res) => {
  res.json({ code: 0, message: 'Order module — Phase 3', data: [] });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handling ──────────────────────────────────────
app.use(errorHandler);

export default app;
