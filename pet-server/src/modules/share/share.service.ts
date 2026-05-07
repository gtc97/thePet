import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

// 生成6位随机分享码
function generateShareCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export class ShareService {
  // 获取宠物的分享列表
  async listByPet(petId: number, userId: number) {
    return prisma.petShare.findMany({
      where: { petId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 创建分享卡片
  async create(petId: number, userId: number, data: {
    title: string; description?: string; images?: string[];
    showAlbum?: boolean; showDiary?: boolean; showServiceLogs?: boolean;
  }) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== userId) throw new AppError(403, '无权操作');
    if (pet.privacy === 'PRIVATE') throw new AppError(400, '私密宠物无法分享');

    // 生成唯一分享码
    let shareCode = generateShareCode();
    let exists = await prisma.petShare.findUnique({ where: { shareCode } });
    while (exists) {
      shareCode = generateShareCode();
      exists = await prisma.petShare.findUnique({ where: { shareCode } });
    }

    return prisma.petShare.create({
      data: {
        petId, userId,
        title: data.title,
        description: data.description || '',
        images: data.images || [],
        showAlbum: data.showAlbum ?? false,
        showDiary: data.showDiary ?? false,
        showServiceLogs: data.showServiceLogs ?? false,
        shareCode,
      },
    });
  }

  // 获取分享详情（通过分享ID）
  async getDetail(shareId: number) {
    const share = await prisma.petShare.findUnique({
      where: { id: shareId },
      include: {
        pet: {
          select: {
            id: true, name: true, species: true, breed: true,
            avatar: true, coverImage: true, description: true,
            gender: true, weight: true, birthDate: true,
            dietHabits: true, taboos: true,
          },
        },
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    if (!share) throw new AppError(404, '分享不存在');

    // 检查宠物是否仍然是公开的
    if (share.pet.privacy === 'PRIVATE') {
      throw new AppError(403, '该宠物已设为私密，分享暂不可用');
    }

    // 增加浏览次数
    await prisma.petShare.update({
      where: { id: shareId },
      data: { viewCount: { increment: 1 } },
    });

    return share;
  }

  // 通过分享码查找
  async getByCode(code: string) {
    const share = await prisma.petShare.findUnique({
      where: { shareCode: code },
      include: {
        pet: {
          select: {
            id: true, name: true, species: true, breed: true,
            avatar: true, coverImage: true, description: true,
            gender: true, weight: true, birthDate: true,
            dietHabits: true, taboos: true,
          },
        },
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    if (!share) throw new AppError(404, '分享不存在或已失效');

    await prisma.petShare.update({
      where: { id: share.id },
      data: { viewCount: { increment: 1 } },
    });

    return share;
  }

  // 点赞
  async like(shareId: number) {
    const share = await prisma.petShare.findUnique({ where: { id: shareId } });
    if (!share) throw new AppError(404, '分享不存在');
    return prisma.petShare.update({
      where: { id: shareId },
      data: { likeCount: { increment: 1 } },
    });
  }

  // 删除分享
  async delete(shareId: number, userId: number) {
    const share = await prisma.petShare.findFirst({
      where: { id: shareId, userId },
    });
    if (!share) throw new AppError(404, '分享不存在或无权删除');
    return prisma.petShare.delete({ where: { id: shareId } });
  }
}

export const shareService = new ShareService();
