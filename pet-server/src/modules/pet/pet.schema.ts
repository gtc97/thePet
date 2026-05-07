import { z } from 'zod';

// 创建宠物参数校验
export const createPetSchema = z.object({
  name: z.string().min(1, '昵称不能为空').max(50, '昵称最多50字'),
  species: z.string().max(30).optional().default(''),
  breed: z.string().max(50).optional().default(''),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional().default('UNKNOWN'),
  birthDate: z.string().optional().nullable(),
  weight: z.number().min(0).max(200).optional().nullable(),
  avatar: z.string().max(500).optional().default(''),
  coverImage: z.string().max(500).optional().default(''),
  dietHabits: z.string().max(2000).optional().default(''),
  taboos: z.string().max(2000).optional().default(''),
  description: z.string().max(5000).optional().default(''),
  privacy: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PUBLIC'),
});

// 更新宠物参数校验（所有字段可选）
export const updatePetSchema = z.object({
  name: z.string().min(1, '昵称不能为空').max(50).optional(),
  species: z.string().max(30).optional(),
  breed: z.string().max(50).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  birthDate: z.string().optional().nullable(),
  weight: z.number().min(0).max(200).optional().nullable(),
  avatar: z.string().max(500).optional(),
  coverImage: z.string().max(500).optional(),
  dietHabits: z.string().max(2000).optional(),
  taboos: z.string().max(2000).optional(),
  description: z.string().max(5000).optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE']).optional(),
});
