import { getPrisma } from '@/database/prisma.js';

interface CreateEventData {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  title: string;
  content: string;
}

interface UpdateEventData {
  title?: string;
  content?: string;
}

export const eventRepository = {
  findByDate: async (userId: string, spaceId: string, date: string) => {
    const prisma = getPrisma();
    return prisma.calendarEvent.findMany({
      where: { userId, spaceId, date },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.calendarEvent.findFirst({
      where: { id, userId, spaceId },
    });
  },

  create: async (data: CreateEventData) => {
    const prisma = getPrisma();
    return prisma.calendarEvent.create({ data });
  },

  update: async (id: string, _userId: string, _spaceId: string, data: UpdateEventData) => {
    const prisma = getPrisma();
    return prisma.calendarEvent.update({
      where: { id },
      data,
    });
  },

  findDatesByMonth: async (userId: string, spaceId: string, yearMonth: string) => {
    const prisma = getPrisma();
    const events = await prisma.calendarEvent.findMany({
      where: { userId, spaceId, date: { startsWith: yearMonth } },
      select: { date: true },
      distinct: ['date'],
    });
    return events.map((e) => e.date);
  },

  remove: async (id: string, _userId: string, _spaceId: string) => {
    const prisma = getPrisma();
    const existing = await prisma.calendarEvent.findFirst({
      where: { id },
    });
    if (!existing) return false;
    await prisma.calendarEvent.delete({ where: { id } });
    return true;
  },
};
