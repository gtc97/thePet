import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { petService } from '../pet/pet.service';

export class PhotoService {
  // 获取宠物照片列表（支持按相册筛选、按素材类型筛选）
  async listByPet(petId: number, viewerId?: number, albumId?: number, sourceType?: string) {
    await petService.getDetail(petId, viewerId);

    const where: Record<string, unknown> = { petId };
    if (albumId) where.albumId = albumId;
    if (sourceType) where.sourceType = sourceType;

    return prisma.petPhoto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 添加照片（关联到宠物和可选相册）
  async addPhotos(
    petId: number, ownerId: number,
    photos: Array<{ url: string; thumbnailUrl?: string; type?: string; sourceType?: string; width?: number; height?: number; size?: number }>,
    albumId?: number
  ) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');
    if (pet.isArchived) throw new AppError(400, '已封存的档案不可编辑');

    // 批量创建照片记录
    const data = photos.map(p => ({
      petId,
      albumId: albumId || null,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl || '',
      type: (p.type as 'IMAGE' | 'VIDEO') || 'IMAGE',
      sourceType: p.sourceType || 'user',
      width: p.width || 0,
      height: p.height || 0,
      size: p.size || 0,
    }));

    // 使用 createMany 批量插入
    await prisma.petPhoto.createMany({ data });
    return { count: data.length };
  }

  // 删除单张照片
  async deletePhoto(photoId: number, petId: number, ownerId: number) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');

    const photo = await prisma.petPhoto.findFirst({
      where: { id: photoId, petId },
    });
    if (!photo) throw new AppError(404, '照片不存在');

    return prisma.petPhoto.delete({ where: { id: photoId } });
  }

  // 更新照片信息（描述等）
  async updatePhoto(photoId: number, petId: number, ownerId: number, data: {
    description?: string; albumId?: number | null;
  }) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作');

    return prisma.petPhoto.update({ where: { id: photoId }, data });
  }
}

export const photoService = new PhotoService();
