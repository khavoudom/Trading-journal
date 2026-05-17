import { getPrisma } from '@/database/prisma.js';
import { Prisma } from '@/generated/prisma/client.js';

interface CreateDrawingData {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  title: string;
  sceneData: Prisma.InputJsonValue;
}

interface UpdateDrawingData {
  title?: string;
  sceneData?: Prisma.InputJsonValue;
}

export const drawingRepository = {
  findAllBySpaceId: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.drawingBoardDrawing.findMany({
      where: { userId, spaceId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  findByDate: async (userId: string, spaceId: string, date: string) => {
    const prisma = getPrisma();
    return prisma.drawingBoardDrawing.findMany({
      where: { userId, spaceId, date },
      orderBy: { updatedAt: 'desc' },
    });
  },

  findById: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.drawingBoardDrawing.findFirst({
      where: { id, userId, spaceId },
    });
  },

  findByIdOnly: async (id: string) => {
    const prisma = getPrisma();
    return prisma.drawingBoardDrawing.findUnique({ where: { id } });
  },

  create: async (data: CreateDrawingData) => {
    const prisma = getPrisma();
    return prisma.drawingBoardDrawing.create({ data });
  },

  update: async (id: string, _userId: string, _spaceId: string, data: UpdateDrawingData) => {
    const prisma = getPrisma();
    return prisma.drawingBoardDrawing.update({
      where: { id },
      data,
    });
  },

  remove: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const existing = await prisma.drawingBoardDrawing.findFirst({ where: { id, userId, spaceId } });
    if (!existing) return false;
    await prisma.drawingBoardDrawing.delete({ where: { id } });
    return true;
  },
};
