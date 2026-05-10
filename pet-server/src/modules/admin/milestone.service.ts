import prisma from '../../config/database';

// 成长里程碑检测服务
export class MilestoneService {
  // 检测宠物生日
  async checkBirthdays() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // 查找本月今天生日的宠物
    const pets = await prisma.pet.findMany({
      where: { birthDate: { not: null }, isArchived: false },
      include: { owner: { select: { id: true } } },
    });

    let count = 0;
    for (const pet of pets) {
      if (!pet.birthDate) continue;
      const bd = new Date(pet.birthDate);
      if (bd.getMonth() + 1 === month && bd.getDate() === day) {
        const age = today.getFullYear() - bd.getFullYear();
        // 检查今天是否已发过提醒
        const exist = await prisma.pushLog.findFirst({
          where: {
            userId: pet.ownerId,
            type: 'SYSTEM',
            title: '宠物生日提醒',
            createdAt: { gte: new Date(today.setHours(0,0,0,0)) },
          },
        });
        if (!exist) {
          await prisma.pushLog.create({
            data: {
              userId: pet.ownerId,
              type: 'SYSTEM',
              title: '🎂 宠物生日提醒',
              content: `今天是「${pet.name}」的${age}岁生日！记得给它准备小惊喜哦~`,
              relatedId: pet.id,
            },
          });
          count++;
        }
      }
    }
    return { checked: pets.length, reminders: count };
  }

  // 检测疫苗到期（基于宠物创建时间推算，实际需用户录入疫苗日期）
  async checkVaccineDue() {
    const today = new Date();
    // 查找创建超过11个月的宠物（假设每年需接种）
    const elevenMonthsAgo = new Date(today);
    elevenMonthsAgo.setMonth(today.getMonth() - 11);

    const pets = await prisma.pet.findMany({
      where: {
        createdAt: { lte: elevenMonthsAgo },
        isArchived: false,
      },
      include: { owner: { select: { id: true } } },
    });

    let count = 0;
    const todayStr = today.toISOString().slice(0, 10);
    for (const pet of pets) {
      const exist = await prisma.pushLog.findFirst({
        where: {
          userId: pet.ownerId,
          type: 'SYSTEM',
          title: '疫苗到期提醒',
          createdAt: { gte: new Date(today.setHours(0,0,0,0)) },
        },
      });
      if (!exist) {
        await prisma.pushLog.create({
          data: {
            userId: pet.ownerId,
            type: 'SYSTEM',
            title: '💉 疫苗到期提醒',
            content: `「${pet.name}」加入已超过11个月，建议带它接种年度疫苗哦`,
            relatedId: pet.id,
          },
        });
        count++;
      }
    }
    return { checked: pets.length, reminders: count };
  }

  // 综合检测
  async runAll() {
    const birthdays = await this.checkBirthdays();
    const vaccines = await this.checkVaccineDue();
    return { birthdays, vaccines };
  }
}

export const milestoneService = new MilestoneService();
