import { v4 as uuidv4 } from 'uuid';
import { eventRepository } from '@/repositories/eventRepository.js';
import { validate } from '@/validation/index.js';
import { createEventSchema, updateEventSchema } from '@/validation/eventSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';
import type { CalendarEvent } from '@/types/event.js';

const mapEvent = (row: any): CalendarEvent => ({
  id: row.id,
  userId: row.userId,
  spaceId: row.spaceId,
  date: row.date,
  title: row.title,
  content: row.content,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const eventService = {
  getEventsByDate: async (
    userId: string,
    spaceId: string,
    date: string,
  ): Promise<CalendarEvent[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!date) throw new AppError('date is required', 400);
    const rows = await eventRepository.findByDate(userId, spaceId, date);
    return rows.map(mapEvent);
  },

  createEvent: async (eventData: unknown, userId: string): Promise<CalendarEvent> => {
    const data = validate(createEventSchema, eventData);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    const id = uuidv4();
    const row = await eventRepository.create({
      id,
      userId,
      spaceId: data.spaceId,
      date: data.date,
      title: data.title,
      content: data.content ?? '',
    });
    return mapEvent(row);
  },

  updateEvent: async (
    id: string,
    eventData: unknown,
    userId: string,
    spaceId: string,
  ): Promise<CalendarEvent> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const data = validate(updateEventSchema, eventData);
    const existing = await eventRepository.findById(id, userId, spaceId);
    if (!existing) throw new AppError('Event not found', 404);
    const row = await eventRepository.update(id, userId, spaceId, data);
    return mapEvent(row);
  },

  getEventDates: async (userId: string, spaceId: string, month: string): Promise<string[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!month) throw new AppError('month is required (YYYY-MM)', 400);
    return eventRepository.findDatesByMonth(userId, spaceId, month);
  },

  deleteEvent: async (id: string, userId: string, spaceId: string): Promise<void> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const deleted = await eventRepository.remove(id, userId, spaceId);
    if (!deleted) throw new AppError('Event not found', 404);
  },
};
