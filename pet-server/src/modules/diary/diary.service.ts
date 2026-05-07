import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { petService } from '../pet/pet.service';

export class DiaryService {
  // 获取宠物日记列表（置顶优先，其余按时间倒序）
  async listByPet(petId: number, viewerId?: number, page = 1, pageSize = 20) {
    await petService.getDetail(petId, viewerId);

    const where = { petId };
    const [total, list] = await Promise.all([
      prisma.petDiary.count({ where }),
      prisma.petDiary.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { pinnedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, title: true, content: true,
          images: true, isPinned: true, createdAt: true, updatedAt: true,
        },
      }),
    ]);
    return { list, total, page, pageSize };
  }

  // 获取单篇日记详情
  async getDetail(diaryId: number, petId: number, viewerId?: number) {
    await petService.getDetail(petId, viewerId);

    const diary = await prisma.petDiary.findFirst({
      where: { id: diaryId, petId },
    });
    if (!diary) throw new AppError(404, '日记不存在');
    return diary;
  }

  // 创建日记
  async create(petId: number, ownerId: number, data: {
    title: string; content: string; images?: string[];
  }) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');
    if (pet.isArchived) throw new AppError(400, '已封存的档案不可新建日记');

    return prisma.petDiary.create({
      data: {
        petId,
        title: data.title,
        content: data.content,
        images: data.images || [],
      },
    });
  }

  // 编辑日记（内容可修改，创建时间不可变）
  async update(diaryId: number, petId: number, ownerId: number, data: {
    title?: string; content?: string; images?: string[];
  }) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');

    const diary = await prisma.petDiary.findFirst({ where: { id: diaryId, petId } });
    if (!diary) throw new AppError(404, '日记不存在');

    return prisma.petDiary.update({ where: { id: diaryId }, data });
  }

  // 删除日记
  async delete(diaryId: number, petId: number, ownerId: number) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');

    const diary = await prisma.petDiary.findFirst({ where: { id: diaryId, petId } });
    if (!diary) throw new AppError(404, '日记不存在');

    return prisma.petDiary.delete({ where: { id: diaryId } });
  }

  // 切换置顶状态
  async togglePin(diaryId: number, petId: number, ownerId: number) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');

    const diary = await prisma.petDiary.findFirst({ where: { id: diaryId, petId } });
    if (!diary) throw new AppError(404, '日记不存在');

    return prisma.petDiary.update({
      where: { id: diaryId },
      data: {
        isPinned: !diary.isPinned,
        pinnedAt: diary.isPinned ? null : new Date(),
      },
    });
  }
}

export const diaryService = new DiaryService();
