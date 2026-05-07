import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class FavoriteService {
  // 我的收藏列表
  async listByUser(userId: number) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: false,
      },
    });
  }

  // 添加收藏
  async add(userId: number, targetType: string, targetId: number) {
    // 检查是否已收藏
    const existing = await prisma.favorite.findFirst({
      where: { userId, targetType, targetId },
    });
    if (existing) throw new AppError(400, '已收藏，不可重复收藏');

    // 收藏宠物时验证宠物存在且公开
    if (targetType === 'pet') {
      const pet = await prisma.pet.findUnique({ where: { id: targetId } });
      if (!pet) throw new AppError(404, '宠物不存在');
      if (pet.privacy !== 'PUBLIC') throw new AppError(400, '私密宠物不可收藏');
    }

    return prisma.favorite.create({
      data: { userId, targetType, targetId },
    });
  }

  // 取消收藏
  async remove(favoriteId: number, userId: number) {
    const fav = await prisma.favorite.findFirst({
      where: { id: favoriteId, userId },
    });
    if (!fav) throw new AppError(404, '收藏不存在');
    return prisma.favorite.delete({ where: { id: favoriteId } });
  }
}

export const favoriteService = new FavoriteService();
