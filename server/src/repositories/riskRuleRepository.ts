import { getPrisma } from '@/database/prisma.js';

export const riskRuleRepository = {
  findByUserAndSpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.riskRule.findMany({
      where: { userId, spaceId },
      orderBy: { createdAt: 'asc' },
    });
  },

  findById: async (id: string) => {
    const prisma = getPrisma();
    return prisma.riskRule.findUnique({ where: { id } });
  },

  create: async (
    userId: string,
    spaceId: string,
    data: { name: string; value: number; unit: string; enabled: boolean },
  ) => {
    const prisma = getPrisma();
    return prisma.riskRule.create({
      data: { userId, spaceId, ...data },
    });
  },

  update: async (
    id: string,
    data: { name?: string; value?: number; unit?: string; enabled?: boolean },
  ) => {
    const prisma = getPrisma();
    return prisma.riskRule.update({
      where: { id },
      data,
    });
  },

  remove: async (id: string) => {
    const prisma = getPrisma();
    await prisma.riskRule.delete({ where: { id } });
  },
};
