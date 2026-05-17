import { getPrisma } from '@/database/prisma.js';
import { Prisma } from '@/generated/prisma/client.js';

interface CreateCalendarDrawingData {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  title: string;
  sceneData: Prisma.InputJsonValue;
}

interface UpdateCalendarDrawingData {
  title?: string;
  sceneData?: Prisma.InputJsonValue;
}

export const calendarDrawingRepository = {
  findAllBySpaceId: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.calendarDrawing.findMany({
      where: { userId, spaceId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  findByDate: async (userId: string, spaceId: string, date: string) => {
    const prisma = getPrisma();
    return prisma.calendarDrawing.findMany({
      where: { userId, spaceId, date },
      orderBy: { updatedAt: 'desc' },
    });
  },

  findDatesByMonth: async (userId: string, spaceId: string, yearMonth: string) => {
    const prisma = getPrisma();
    const drawings = await prisma.calendarDrawing.findMany({
      where: { userId, spaceId, date: { startsWith: yearMonth } },
      select: { date: true },
      distinct: ['date'],
    });
    return drawings.map((drawing) => drawing.date);
  },

  findById: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.calendarDrawing.findFirst({
      where: { id, userId, spaceId },
    });
  },

  create: async (data: CreateCalendarDrawingData) => {
    const prisma = getPrisma();
    return prisma.calendarDrawing.create({ data });
  },

  update: async (
    id: string,
    _userId: string,
    _spaceId: string,
    data: UpdateCalendarDrawingData,
  ) => {
    const prisma = getPrisma();
    return prisma.calendarDrawing.update({
      where: { id },
      data,
    });
  },

  remove: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const existing = await prisma.calendarDrawing.findFirst({ where: { id, userId, spaceId } });
    if (!existing) return false;
    await prisma.calendarDrawing.delete({ where: { id } });
    return true;
  },
};
