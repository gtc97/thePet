import { Router, Response, NextFunction } from 'express';
import { AuthRequest, success } from '../../types';
import { authMiddleware } from '../../middleware/auth';
import prisma from '../../config/database';

const router = Router();

// 提交反馈（登录用户）
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fb = await prisma.feedback.create({
      data: {
        userId: req.user!.userId,
        type: req.body.type || 'other',
        content: req.body.content,
        contact: req.body.contact || '',
      },
    });
    res.json(success(fb, '感谢你的反馈！'));
  } catch (err) { next(err); }
});

// 提交反馈（匿名）
router.post('/anonymous', async (req, res, next) => {
  try {
    await prisma.feedback.create({
      data: {
        type: req.body.type || 'other',
        content: req.body.content,
        contact: req.body.contact || '',
      },
    });
    res.json(success(null, '感谢你的反馈！'));
  } catch (err) { next(err); }
});

export default router;
