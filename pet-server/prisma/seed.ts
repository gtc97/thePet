import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充测试数据...');

  // ─── 清理旧数据 ───
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.orderStatusLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.blacklist.deleteMany();
  await prisma.depositLog.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.petDiary.deleteMany();
  await prisma.petPhoto.deleteMany();
  await prisma.petAlbum.deleteMany();
  await prisma.petShare.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.pushLog.deleteMany();
  await prisma.warningLog.deleteMany();
  await prisma.serviceLocation.deleteMany();
  await prisma.user.deleteMany();

  // ─── 创建用户 ───
  const pw = await bcrypt.hash('123456', 10);

  // 宠主1：小明（新手）
  const owner1 = await prisma.user.create({
    data: {
      phone: '13900001111', password: pw,
      nickname: '小明养猫', avatar: '',
      roles: ['PET_OWNER'], city: '北京市朝阳区', bio: '家有两只毛孩子，爱猫人士',
      qualificationStatus: null, points: 0, level: 0,
    },
  });

  // 宠主2：小红（活跃用户）
  const owner2 = await prisma.user.create({
    data: {
      phone: '13900002222', password: pw,
      nickname: '小红爱宠', avatar: '',
      roles: ['PET_OWNER'], city: '北京市海淀区', bio: '狗狗教资深成员',
      qualificationStatus: null, points: 0, level: 0,
    },
  });

  // 宠护师1：张宠护（高评分）
  const provider1 = await prisma.user.create({
    data: {
      phone: '13900003333', password: pw,
      nickname: '张宠护师', avatar: '',
      roles: ['PET_OWNER', 'SERVICE_PROVIDER'], city: '北京市朝阳区',
      bio: '5年宠物护理经验，温柔耐心，熟悉各类猫咪',
      qualificationStatus: 'approved', depositPaid: true,
      avgRating: 4.8, totalOrders: 32, points: 280, level: 4,
    },
  });

  // 宠护师2：李宠护（新人）
  const provider2 = await prisma.user.create({
    data: {
      phone: '13900004444', password: pw,
      nickname: '李宠护师', avatar: '',
      roles: ['PET_OWNER', 'SERVICE_PROVIDER'], city: '北京市海淀区',
      bio: '爱宠人士，认真负责，提供上门喂养/清洁服务',
      qualificationStatus: 'approved', depositPaid: true,
      avgRating: 4.5, totalOrders: 8, points: 45, level: 1,
    },
  });

  // 押金
  for (const p of [provider1, provider2]) {
    await prisma.deposit.create({
      data: { userId: p.id, amount: 100, status: 'PAID', transactionId: `DEPOSIT_${p.id}_${Date.now()}`, paidAt: new Date() },
    });
  }

  console.log(`✅ 创建 4 个用户: ${owner1.nickname}, ${owner2.nickname}, ${provider1.nickname}, ${provider2.nickname}`);

  // ─── 创建宠物 ───
  const pets = [
    { ownerId: owner1.id, name: '咪咪', species: '猫', breed: '英短', gender: 'FEMALE' as const, birthDate: '2023-03-15', weight: 4.5, description: '温柔粘人的小母猫', dietHabits: '早晚各一顿猫粮，喜欢罐头', taboos: '不能吃鱼' },
    { ownerId: owner1.id, name: '橘子', species: '猫', breed: '橘猫', gender: 'MALE' as const, birthDate: '2022-08-20', weight: 7.2, description: '贪吃的大胖橘', dietHabits: '少吃多餐，控制体重', taboos: '不能吃太多零食' },
    { ownerId: owner2.id, name: '旺财', species: '狗', breed: '金毛', gender: 'MALE' as const, birthDate: '2024-01-10', weight: 25, description: '活泼好动的金毛犬', dietHabits: '一天两顿狗粮+骨头', taboos: '不能吃巧克力' },
    { ownerId: provider1.id, name: '花花', species: '猫', breed: '布偶', gender: 'FEMALE' as const, birthDate: '2021-06-05', weight: 5.5, description: '优雅的布偶公主', dietHabits: '定时定量，偏好鱼味猫粮' },
    { ownerId: provider2.id, name: '豆豆', species: '狗', breed: '柯基', gender: 'MALE' as const, birthDate: '2023-11-20', weight: 12, description: '短腿小可爱', dietHabits: '一天两顿，喜欢肉干零食' },
  ];

  const createdPets = [];
  for (const pet of pets) {
    const p = await prisma.pet.create({
      data: { ...pet, birthDate: new Date(pet.birthDate) },
    });
    createdPets.push(p);
  }
  console.log(`✅ 创建 ${createdPets.length} 只宠物`);

  // ─── 创建日记 ───
  const diaries = [
    { petId: createdPets[0].id, title: '咪咪今天打疫苗', content: '带咪咪去宠物医院打年度疫苗，小家伙很勇敢，一声没叫！医生说她很健康。', images: [] },
    { petId: createdPets[0].id, title: '新买的猫爬架到了', content: '给咪咪买的新猫爬架，她超级喜欢，一直在上面跳来跳去。橘子在下面看着眼馋。', images: [] },
    { petId: createdPets[1].id, title: '橘子减肥第一天', content: '今天开始给橘子控制饮食了，它一脸不情愿的样子太搞笑了。希望能瘦到6公斤！', images: [] },
    { petId: createdPets[2].id, title: '旺财学会握手了', content: '训练了一周终于学会了！太有成就感了，奖励了一根大骨头。', images: [] },
    { petId: createdPets[3].id, title: '花花的日常', content: '布偶猫真的是仙女猫，每天睡姿都那么优雅～', images: [] },
  ];

  for (const d of diaries) {
    await prisma.petDiary.create({ data: { ...d, images: d.images as any } });
  }
  console.log(`✅ 创建 ${diaries.length} 篇日记`);

  // ─── 服务地址 ───
  await prisma.serviceLocation.create({ data: { userId: provider1.id, address: '北京市朝阳区望京SOHO', latitude: 39.993, longitude: 116.474, city: '北京市', district: '朝阳区', isDefault: true } });
  await prisma.serviceLocation.create({ data: { userId: provider2.id, address: '北京市海淀区中关村', latitude: 39.983, longitude: 116.311, city: '北京市', district: '海淀区', isDefault: true } });

  // ─── 创建订单 ───
  // 已完成订单（owner1 → provider1）
  const order1 = await prisma.serviceOrder.create({
    data: {
      orderNo: '2026050100001', ownerId: owner1.id, providerId: provider1.id,
      petIds: [createdPets[0].id] as any, serviceType: '喂食', status: 'COMPLETED',
      address: '北京市朝阳区望京花园', scheduledDate: new Date('2026-05-01'), timeSlot: 'morning',
      price: 30, paymentStatus: 'PAID', completedAt: new Date('2026-05-01'), ownerConfirmedAt: new Date('2026-05-01'),
    },
  });
  await prisma.orderStatusLog.createMany({
    data: [
      { orderId: order1.id, toStatus: 'PENDING', remark: '订单已创建' },
      { orderId: order1.id, fromStatus: 'PENDING', toStatus: 'ACCEPTED', remark: '张宠护师已接单' },
      { orderId: order1.id, fromStatus: 'ACCEPTED', toStatus: 'PAID', remark: '宠主已付款' },
      { orderId: order1.id, fromStatus: 'PAID', toStatus: 'IN_PROGRESS', remark: '服务已开始' },
      { orderId: order1.id, fromStatus: 'IN_PROGRESS', toStatus: 'WAITING_CONFIRM', remark: '服务完成，等待确认' },
      { orderId: order1.id, fromStatus: 'WAITING_CONFIRM', toStatus: 'COMPLETED', remark: '宠主确认完成' },
    ],
  });

  // 已完成订单（owner2 → provider2）
  const order2 = await prisma.serviceOrder.create({
    data: {
      orderNo: '2026050200002', ownerId: owner2.id, providerId: provider2.id,
      petIds: [createdPets[2].id] as any, serviceType: '铲屎', status: 'COMPLETED',
      address: '北京市海淀区知春路', scheduledDate: new Date('2026-05-02'), timeSlot: 'afternoon',
      price: 20, paymentStatus: 'PAID', completedAt: new Date('2026-05-02'), ownerConfirmedAt: new Date('2026-05-02'),
    },
  });
  await prisma.orderStatusLog.createMany({
    data: [
      { orderId: order2.id, toStatus: 'PENDING', remark: '订单已创建' },
      { orderId: order2.id, fromStatus: 'PENDING', toStatus: 'ACCEPTED', remark: '李宠护师已接单' },
      { orderId: order2.id, fromStatus: 'ACCEPTED', toStatus: 'COMPLETED', remark: '快捷完成' },
    ],
  });

  // 进行中订单（owner1 → provider2）
  const order3 = await prisma.serviceOrder.create({
    data: {
      orderNo: '2026050800003', ownerId: owner1.id, providerId: provider2.id,
      petIds: [createdPets[1].id] as any, serviceType: '环境清理', status: 'IN_PROGRESS',
      address: '北京市朝阳区望京花园', scheduledDate: new Date('2026-05-09'), timeSlot: 'morning',
      price: 25, paymentStatus: 'PAID',
    },
  });

  // 待接单开放订单
  const order4 = await prisma.serviceOrder.create({
    data: {
      orderNo: '2026050900004', ownerId: owner2.id, providerId: null,
      petIds: [createdPets[2].id] as any, serviceType: '换水', status: 'PENDING',
      address: '北京市海淀区中关村大街', scheduledDate: new Date('2026-05-10'), timeSlot: 'morning',
      price: 10,
    },
  });

  // 等待确认订单
  const order5 = await prisma.serviceOrder.create({
    data: {
      orderNo: '2026050800005', ownerId: owner1.id, providerId: provider1.id,
      petIds: [createdPets[0].id] as any, serviceType: '喂食', status: 'WAITING_CONFIRM',
      address: '北京市朝阳区望京花园', scheduledDate: new Date('2026-05-08'), timeSlot: 'evening',
      price: 30, paymentStatus: 'PAID',
    },
  });

  console.log('✅ 创建 5 笔订单（覆盖各状态）');

  // ─── 评价 ───
  await prisma.review.create({
    data: { orderId: order1.id, reviewerId: owner1.id, revieweeId: provider1.id, rating: 5, content: '张宠护师非常专业，对猫咪很温柔，下次还找她！', tags: ['认真负责', '温柔耐心'] as any },
  });
  await prisma.review.create({
    data: { orderId: order2.id, reviewerId: owner2.id, revieweeId: provider2.id, rating: 4, content: '李宠护师态度很好，按时到达，清理得干净。', tags: ['按时到达', '干净整洁'] as any },
  });
  console.log('✅ 创建 2 条评价');

  // ─── 通知 ───
  await prisma.pushLog.createMany({
    data: [
      { userId: provider1.id, type: 'ORDER', title: '新订单提醒', content: '小明养猫向你发来新订单', relatedId: order3.id },
      { userId: provider1.id, type: 'ORDER', title: '订单待确认', content: '订单2026050800005等待确认', relatedId: order5.id },
      { userId: provider2.id, type: 'ORDER', title: '新订单提醒', content: '小红爱宠向你发来新订单', relatedId: order3.id },
      { userId: owner1.id, type: 'ORDER', title: '服务完成', content: '订单2026050800005已完成，请验收', relatedId: order5.id },
    ],
  });

  // ─── 平台配置 ───
  await prisma.systemConfig.upsert({
    where: { key: 'services' },
    update: { value: JSON.stringify([{ name: '喂食', price: 30 }, { name: '换水', price: 10 }, { name: '铲屎', price: 20 }, { name: '环境清理', price: 25 }]) },
    create: { key: 'services', value: JSON.stringify([{ name: '喂食', price: 30 }, { name: '换水', price: 10 }, { name: '铲屎', price: 20 }, { name: '环境清理', price: 25 }]) },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'announcements' },
    update: { value: JSON.stringify([{ id: 1, title: 'thePet 正式上线', content: '欢迎使用 thePet，记录毛孩子的每一个瞬间！', createdAt: new Date().toISOString() }]) },
    create: { key: 'announcements', value: JSON.stringify([{ id: 1, title: 'thePet 正式上线', content: '欢迎使用 thePet，记录毛孩子的每一个瞬间！', createdAt: new Date().toISOString() }]) },
  });

  console.log('✅ 配置服务类型 + 公告');
  console.log('');
  console.log('📋 测试账号汇总:');
  console.log('   宠主1: 13900001111 / 123456 — 小明养猫 (2猫)');
  console.log('   宠主2: 13900002222 / 123456 — 小红爱宠 (1狗)');
  console.log('   宠护1: 13900003333 / 123456 — 张宠护师 Lv.4 ⭐4.8');
  console.log('   宠护2: 13900004444 / 123456 — 李宠护师 Lv.1 ⭐4.5');
  console.log('   管理员: admin / admin123');
  console.log('');
  console.log('🌱 测试数据填充完成！');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
