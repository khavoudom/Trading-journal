import { getPrisma } from '@/database/prisma.js';

export const settingRepository = {
  findByUserAndKey: async (userId: string, key: string, spaceId?: string) => {
    const prisma = getPrisma();
    return prisma.setting.findFirst({
      where: { userId, key, spaceId: spaceId ?? null },
    });
  },

  findById: async (id: string) => {
    const prisma = getPrisma();
    return prisma.setting.findUnique({ where: { id } });
  },

  findAllByUser: async (userId: string, spaceId?: string) => {
    const prisma = getPrisma();
    const where: Record<string, unknown> = { userId };
    if (spaceId !== undefined) {
      where.spaceId = spaceId;
    }
    return prisma.setting.findMany({
      where: where as any,
      orderBy: { key: 'asc' },
    });
  },

  upsert: async (userId: string, key: string, value: unknown, spaceId?: string) => {
    const prisma = getPrisma();
    const existing = await prisma.setting.findFirst({
      where: { userId, key, spaceId: spaceId ?? null },
    });

    if (existing) {
      return prisma.setting.update({
        where: { id: existing.id },
        data: { value: value as any },
      });
    }

    return prisma.setting.create({
      data: { userId, spaceId: spaceId ?? null, key, value: value as any },
    });
  },

  remove: async (id: string) => {
    const prisma = getPrisma();
    await prisma.setting.delete({ where: { id } });
  },
};
