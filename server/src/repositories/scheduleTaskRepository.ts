import { getPrisma } from '@/database/prisma.js';

interface CreateScheduleTaskData {
  id: string;
  userId: string;
  spaceId: string;
  title: string;
  time?: string | null;
  timeEnd?: string | null;
  taskDate: string;
  completed: boolean;
  description?: string | null;
  type: string;
  repeatGroupId?: string | null;
  reminder?: number | null;
}

interface UpdateScheduleTaskData {
  title?: string;
  time?: string | null;
  timeEnd?: string | null;
  completed?: boolean;
  description?: string | null;
  type?: string;
  reminder?: number | null;
}

export const scheduleTaskRepository = {
  findByDate: async (userId: string, spaceId: string, taskDate: string) => {
    const prisma = getPrisma();
    return prisma.scheduleTask.findMany({
      where: { userId, spaceId, taskDate },
      orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
    });
  },

  findByMonth: async (userId: string, spaceId: string, yearMonth: string) => {
    const prisma = getPrisma();
    return prisma.scheduleTask.findMany({
      where: {
        userId,
        spaceId,
        taskDate: { startsWith: yearMonth },
      },
      orderBy: [{ taskDate: 'asc' }, { time: 'asc' }],
    });
  },

  findById: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.scheduleTask.findFirst({
      where: { id, userId, spaceId },
    });
  },

  create: async (data: CreateScheduleTaskData) => {
    const prisma = getPrisma();
    return prisma.scheduleTask.create({ data });
  },

  createMany: async (data: CreateScheduleTaskData[]) => {
    const prisma = getPrisma();
    return prisma.scheduleTask.createMany({ data });
  },

  update: async (id: string, _userId: string, _spaceId: string, data: UpdateScheduleTaskData) => {
    const prisma = getPrisma();
    return prisma.scheduleTask.update({
      where: { id },
      data,
    });
  },

  remove: async (id: string, _userId: string, _spaceId: string) => {
    const prisma = getPrisma();
    const existing = await prisma.scheduleTask.findFirst({ where: { id } });
    if (!existing) return false;
    await prisma.scheduleTask.delete({ where: { id } });
    return true;
  },

  findPendingReminders: async () => {
    const prisma = getPrisma();
    return prisma.scheduleTask.findMany({
      where: {
        reminderSent: false,
        reminder: { not: null },
        completed: false,
      },
      include: { user: { select: { email: true } } },
    });
  },

  markReminderSent: async (ids: string[]) => {
    const prisma = getPrisma();
    await prisma.scheduleTask.updateMany({
      where: { id: { in: ids } },
      data: { reminderSent: true },
    });
  },
};
