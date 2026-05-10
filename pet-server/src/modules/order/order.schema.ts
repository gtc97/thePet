import { z } from 'zod';

// 创建订单参数校验
export const createOrderSchema = z.object({
  petIds: z.array(z.number()).min(1, '请选择至少一只宠物'),
  serviceType: z.string().min(1, '请选择服务类型'),
  address: z.string().min(1, '请填写服务地址').max(300),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  scheduledDate: z.string().min(1, '请选择上门日期'),
  timeSlot: z.enum(['morning', 'afternoon', 'evening'], { message: '请选择有效的服务时段' }),
  price: z.number().min(0.01, '金额不能为0'),
  ownerNote: z.string().max(2000).optional().default(''),
});

// 取消订单参数校验
export const cancelOrderSchema = z.object({
  reason: z.string().min(1, '请填写取消原因').max(500),
});

// 完成服务参数校验
export const completeOrderSchema = z.object({
  resultImages: z.array(z.string()).optional().default([]),
  summary: z.string().max(2000).optional().default(''),
});
