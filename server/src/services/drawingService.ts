import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@/errors/AppError.js';
import { validate } from '@/validation/index.js';
import { Prisma } from '@/generated/prisma/client.js';
import { drawingRepository } from '@/repositories/drawingRepository.js';
import { createDrawingSchema, updateDrawingSchema } from '@/validation/drawingSchemas.js';
import { authorizationService } from '@/services/authorizationService.js';
import type { DrawingBoardDrawing } from '@/types/drawing.js';

const mapDrawing = (row: any): DrawingBoardDrawing => ({
  id: row.id,
  userId: row.userId,
  spaceId: row.spaceId,
  date: row.date,
  title: row.title,
  sceneData: row.sceneData as Record<string, unknown>,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const drawingService = {
  getAllDrawings: async (userId: string, spaceId: string): Promise<DrawingBoardDrawing[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const rows = await drawingRepository.findAllBySpaceId(userId, spaceId);
    return rows.map(mapDrawing);
  },

  getDrawingsByDate: async (
    userId: string,
    spaceId: string,
    date: string,
  ): Promise<DrawingBoardDrawing[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!date) throw new AppError('date is required', 400);
    const rows = await drawingRepository.findByDate(userId, spaceId, date);
    return rows.map(mapDrawing);
  },

  getDrawing: async (id: string, userId: string, spaceId: string): Promise<DrawingBoardDrawing> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const row = await drawingRepository.findById(id, userId, spaceId);
    if (!row) throw new AppError('Drawing not found', 404);
    return mapDrawing(row);
  },

  createDrawing: async (drawingData: unknown, userId: string): Promise<DrawingBoardDrawing> => {
    const data = validate(createDrawingSchema, drawingData);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    const id = uuidv4();
    const row = await drawingRepository.create({
      id,
      userId,
      spaceId: data.spaceId,
      date: data.date,
      title: data.title ?? 'Drawing',
      sceneData: data.sceneData as Prisma.InputJsonValue,
    });
    return mapDrawing(row);
  },

  updateDrawing: async (
    id: string,
    drawingData: unknown,
    userId: string,
    spaceId: string,
  ): Promise<DrawingBoardDrawing> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const data = validate(updateDrawingSchema, drawingData);
    const existing = await drawingRepository.findByIdOnly(id);
    if (!existing) throw new AppError('Drawing not found', 404);
    if (existing.userId !== userId || existing.spaceId !== spaceId) {
      throw new AppError('Drawing not found', 404);
    }
    const row = await drawingRepository.update(id, userId, spaceId, data as any);
    return mapDrawing(row);
  },

  deleteDrawing: async (id: string, userId: string, spaceId: string): Promise<void> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const deleted = await drawingRepository.remove(id, userId, spaceId);
    if (!deleted) throw new AppError('Drawing not found', 404);
  },
};
