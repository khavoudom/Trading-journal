import { v4 as uuidv4 } from 'uuid';
import { calendarDrawingRepository } from '@/repositories/calendarDrawingRepository.js';
import { validate } from '@/validation/index.js';
import { createDrawingSchema, updateDrawingSchema } from '@/validation/drawingSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { Prisma } from '@/generated/prisma/client.js';
import { authorizationService } from '@/services/authorizationService.js';
import type { CalendarDrawing } from '@/types/drawing.js';

const mapDrawing = (row: any): CalendarDrawing => ({
  id: row.id,
  userId: row.userId,
  spaceId: row.spaceId,
  date: row.date,
  title: row.title,
  sceneData: row.sceneData as Record<string, unknown>,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const calendarDrawingService = {
  getAllDrawings: async (userId: string, spaceId: string): Promise<CalendarDrawing[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const rows = await calendarDrawingRepository.findAllBySpaceId(userId, spaceId);
    return rows.map(mapDrawing);
  },

  getDrawingsByDate: async (
    userId: string,
    spaceId: string,
    date: string,
  ): Promise<CalendarDrawing[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!date) throw new AppError('date is required', 400);
    const rows = await calendarDrawingRepository.findByDate(userId, spaceId, date);
    return rows.map(mapDrawing);
  },

  getDrawingDates: async (userId: string, spaceId: string, month: string): Promise<string[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!month) throw new AppError('month is required (YYYY-MM)', 400);
    return calendarDrawingRepository.findDatesByMonth(userId, spaceId, month);
  },

  getDrawing: async (id: string, userId: string, spaceId: string): Promise<CalendarDrawing> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const row = await calendarDrawingRepository.findById(id, userId, spaceId);
    if (!row) throw new AppError('Drawing not found', 404);
    return mapDrawing(row);
  },

  createDrawing: async (drawingData: unknown, userId: string): Promise<CalendarDrawing> => {
    const data = validate(createDrawingSchema, drawingData);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    const row = await calendarDrawingRepository.create({
      id: uuidv4(),
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
  ): Promise<CalendarDrawing> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const data = validate(updateDrawingSchema, drawingData);
    const existing = await calendarDrawingRepository.findById(id, userId, spaceId);
    if (!existing) throw new AppError('Drawing not found', 404);
    const row = await calendarDrawingRepository.update(id, userId, spaceId, data as any);
    return mapDrawing(row);
  },

  deleteDrawing: async (id: string, userId: string, spaceId: string): Promise<void> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const deleted = await calendarDrawingRepository.remove(id, userId, spaceId);
    if (!deleted) throw new AppError('Drawing not found', 404);
  },
};
