import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { signToken } from '../../utils/jwt';

export class UserService {
  // 获取当前用户信息
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, nickname: true, avatar: true,
        roles: true, status: true, province: true, city: true, district: true,
        address: true, bio: true, avgRating: true, totalOrders: true,
        depositPaid: true, qualificationStatus: true, chatDisabled: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError(404, '用户不存在');
    return user;
  }

  // 获取用户公开信息（脱敏）
  async getPublicProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, nickname: true, avatar: true, bio: true,
        avgRating: true, totalOrders: true, city: true,
      },
    });
    if (!user) throw new AppError(404, '用户不存在');
    return user;
  }

  // 更新个人信息
  async updateProfile(userId: number, data: {
    nickname?: string;
    avatar?: string;
    bio?: string;
    province?: string;
    city?: string;
    district?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    chatDisabled?: boolean;
  }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, nickname: true, avatar: true, bio: true,
        province: true, city: true, district: true, address: true,
        chatDisabled: true, updatedAt: true,
      },
    });
  }

  // 提交资质申请（宠物主 → 上门师傅身份申请）
  async submitQualification(userId: number, data: {
    realName: string;
    idCard: string;
    photos: string[];
    bio: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');

    if (user.qualificationStatus === 'pending') {
      throw new AppError(400, '资质审核中，请耐心等待');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        qualificationStatus: 'pending',
        qualificationData: data as unknown as object,
      },
    });
  }

  // 切换当前活跃身份
  async switchRole(userId: number, role: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, '用户不存在');

    const roles = user.roles as string[];
    if (!roles.includes(role)) {
      // 检查是否是申请了但未审核通过的师傅
      if (role === 'SERVICE_PROVIDER') {
        if (user.qualificationStatus !== 'approved') {
          throw new AppError(400, '服务方资质未通过审核');
        }
        // 自动添加角色
        roles.push('SERVICE_PROVIDER');
        await prisma.user.update({
          where: { id: userId },
          data: { roles: roles as unknown as object },
        });
      } else {
        throw new AppError(400, '无该身份权限');
      }
    }

    // 返回新的token
    return { token: signToken({ userId, roles }), currentRole: role };
  }

  // 获取服务地址列表
  async getLocations(userId: number) {
    return prisma.serviceLocation.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  // 添加服务地址
  async addLocation(userId: number, data: {
    address: string;
    latitude: number;
    longitude: number;
    city?: string;
    district?: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await prisma.serviceLocation.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.serviceLocation.create({
      data: { userId, ...data },
    });
  }

  // 更新服务地址
  async updateLocation(locationId: number, userId: number, data: {
    address?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }) {
    const loc = await prisma.serviceLocation.findFirst({
      where: { id: locationId, userId },
    });
    if (!loc) throw new AppError(404, '地址不存在');

    if (data.isDefault) {
      await prisma.serviceLocation.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.serviceLocation.update({
      where: { id: locationId },
      data,
    });
  }

  // 删除服务地址
  async deleteLocation(locationId: number, userId: number) {
    const loc = await prisma.serviceLocation.findFirst({
      where: { id: locationId, userId },
    });
    if (!loc) throw new AppError(404, '地址不存在');
    return prisma.serviceLocation.delete({ where: { id: locationId } });
  }
}

export const userService = new UserService();
