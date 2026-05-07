import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { petService } from '../pet/pet.service';

export class AlbumService {
  // 获取宠物相册列表
  async listByPet(petId: number, viewerId?: number) {
    // 验证宠物存在且有权查看
    await petService.getDetail(petId, viewerId);

    return prisma.petAlbum.findMany({
      where: { petId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { photos: true } },
        photos: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { url: true, thumbnailUrl: true },
        },
      },
    });
  }

  // 创建相册
  async create(petId: number, ownerId: number, data: {
    name: string; description?: string; coverImage?: string;
  }) {
    await this.ensurePetOwner(petId, ownerId);

    return prisma.petAlbum.create({
      data: { petId, name: data.name, description: data.description || '', coverImage: data.coverImage || '' },
    });
  }

  // 更新相册
  async update(albumId: number, petId: number, ownerId: number, data: {
    name?: string; description?: string; coverImage?: string; sortOrder?: number;
  }) {
    await this.ensurePetOwner(petId, ownerId);
    const album = await prisma.petAlbum.findFirst({ where: { id: albumId, petId } });
    if (!album) throw new AppError(404, '相册不存在');

    return prisma.petAlbum.update({ where: { id: albumId }, data });
  }

  // 删除相册
  async delete(albumId: number, petId: number, ownerId: number) {
    await this.ensurePetOwner(petId, ownerId);
    const album = await prisma.petAlbum.findFirst({ where: { id: albumId, petId } });
    if (!album) throw new AppError(404, '相册不存在');

    // 相册删除时，照片的albumId会被设为null（SetNull），照片本身保留
    return prisma.petAlbum.delete({ where: { id: albumId } });
  }

  private async ensurePetOwner(petId: number, ownerId: number) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new AppError(404, '宠物不存在');
    if (pet.ownerId !== ownerId) throw new AppError(403, '无权操作该宠物');
    if (pet.isArchived) throw new AppError(400, '已封存的档案不可编辑');
    return pet;
  }
}

export const albumService = new AlbumService();
