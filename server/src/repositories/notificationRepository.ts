import { getPrisma } from '@/database/prisma.js';
import { Prisma } from '@/generated/prisma/client.js';

interface CreateNotificationData {
  id: string;
  userId: string;
  spaceId: string;
  type: string;
  category: string;
  title: string;
  description: string;
  status: string;
  linkPath?: string | null;
  metadata: Prisma.InputJsonValue;
}

export const notificationRepository = {
  findBySpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.notification.findMany({
      where: { userId, spaceId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findUnreadBySpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.notification.findMany({
      where: { userId, spaceId, status: 'unread' },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string, userId: string) => {
    const prisma = getPrisma();
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  },

  create: async (data: CreateNotificationData) => {
    const prisma = getPrisma();
    return prisma.notification.create({ data });
  },

  createMany: async (data: CreateNotificationData[]) => {
    const prisma = getPrisma();
    return prisma.notification.createMany({ data });
  },

  markRead: async (id: string, _userId: string) => {
    const prisma = getPrisma();
    return prisma.notification.update({
      where: { id },
      data: { status: 'read' },
    });
  },

  markAllRead: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    await prisma.notification.updateMany({
      where: { userId, spaceId, status: 'unread' },
      data: { status: 'read' },
    });
  },

  remove: async (id: string, _userId: string) => {
    const prisma = getPrisma();
    const existing = await prisma.notification.findFirst({ where: { id } });
    if (!existing) return false;
    await prisma.notification.delete({ where: { id } });
    return true;
  },

  deleteByType: async (userId: string, spaceId: string, type: string) => {
    const prisma = getPrisma();
    await prisma.notification.deleteMany({
      where: { userId, spaceId, type },
    });
  },
};
