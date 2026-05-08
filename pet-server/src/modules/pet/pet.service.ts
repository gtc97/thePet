import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class PetService {
  // 获取当前用户的宠物列表（支持封存筛选）
  async listByOwner(ownerId: number, isArchived = false) {
    return prisma.pet.findMany({
      where: { ownerId, isArchived },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, name: true, species: true, breed: true,
        gender: true, avatar: true, privacy: true, isArchived: true,
        birthDate: true, createdAt: true,
        _count: { select: { photos: true, diaries: true } },
      },
    });
  }

  // 获取宠物详情
  async getDetail(petId: number, viewerId?: number) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: {
          select: { id: true, nickname: true, avatar: true, city: true },
        },
      },
    });
    if (!pet) throw new AppError(404, '宠物不存在');

    // 隐私检查：私密宠物仅主人可查看
    if (pet.privacy === 'PRIVATE' && (!viewerId || viewerId !== pet.ownerId)) {
      throw new AppError(403, '该宠物档案为私密状态，无法查看');
    }

    return pet;
  }

  // 创建宠物
  async create(ownerId: number, data: {
    name: string; species?: string; breed?: string;
    gender?: string; birthDate?: string | null; weight?: number | null;
    avatar?: string; coverImage?: string;
    dietHabits?: string; taboos?: string; description?: string;
    privacy?: string;
  }) {
    return prisma.pet.create({
      data: {
        ownerId,
        name: data.name,
        species: data.species || '',
        breed: data.breed || '',
        gender: (data.gender as 'MALE' | 'FEMALE' | 'UNKNOWN') || 'UNKNOWN',
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        weight: data.weight ?? null,
        avatar: data.avatar || '',
        coverImage: data.coverImage || '',
        dietHabits: data.dietHabits || '',
        taboos: data.taboos || '',
        description: data.description || '',
        privacy: (data.privacy as 'PUBLIC' | 'PRIVATE') || 'PUBLIC',
      },
    });
  }

  // 更新宠物信息
  async update(petId: number, ownerId: number, data: Record<string, unknown>) {
    const pet = await this.ensureOwner(petId, ownerId);
    if (pet.isArchived) throw new AppError(400, '已封存的宠物档案不可编辑');

    // 处理日期字段
    const updateData: Record<string, unknown> = { ...data };
    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate ? new Date(data.birthDate as string) : null;
    }

    return prisma.pet.update({
      where: { id: petId },
      data: updateData,
    });
  }

  // 删除宠物（级联清空相册、日记、服务记录）
  async delete(petId: number, ownerId: number) {
    await this.ensureOwner(petId, ownerId);
    // Prisma 的 onDelete: Cascade 会自动清理关联数据
    return prisma.pet.delete({ where: { id: petId } });
  }

  // 封存档案
  async archive(petId: number, ownerId: number) {
    await this.ensureOwner(petId, ownerId);
    return prisma.pet.update({
      where: { id: petId },
      data: { isArchived: true, archivedAt: new Date() },
    });
  }

  // 解除封存
  async unarchive(petId: number, ownerId: number) {
    await this.ensureOwner(petId, ownerId);
    return prisma.pet.update({
      where: { id: petId },
      data: { isArchived: false, archivedAt: null },
    });
  }

  // 宠物数据统计看板
  async getStats(petId: number, viewerId?: number) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: {
        id: true, ownerId: true, privacy: true, createdAt: true,
        _count: { select: { photos: true, diaries: true } },
      },
    });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.privacy === 'PRIVATE' && (!viewerId || viewerId !== pet.ownerId)) {
      throw new AppError(403, '私密档案无法查看统计数据');
    }

    // 计算饲养天数
    const days = Math.floor(
      (Date.now() - pet.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 查询关联订单数
    const orderCount = await prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*) as cnt FROM service_orders WHERE JSON_CONTAINS(petIds, ${String(petId)})
    `.then(r => Number(r[0]?.cnt || 0)).catch(() => 0);

    return {
      days,
      diaryCount: pet._count.diaries,
      photoCount: pet._count.photos,
      orderCount,
    };
  }

  // 公开宠物列表（首页「发现萌宠」）
  async listPublic(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      prisma.pet.findMany({
        where: { privacy: 'PUBLIC', isArchived: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true, name: true, species: true, breed: true,
          avatar: true, coverImage: true, createdAt: true,
          owner: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      prisma.pet.count({ where: { privacy: 'PUBLIC', isArchived: false } }),
    ]);
    return { list, total, page, pageSize };
  }

  // 验证宠物归属权
  private async ensureOwner(petId: number, ownerId: number) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作该宠物');
    return pet;
  }
}

export const petService = new PetService();
