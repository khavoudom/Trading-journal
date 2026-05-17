import { Response } from 'express';
import { eventService } from '@/services/eventService.js';
import { AuthRequest } from '@/middleware/auth.js';

export const eventController = {
  getEventsByDate: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const date = (req.query.date as string) || '';
      const events = await eventService.getEventsByDate(req.userId!, spaceId, date);
      return res.json(events);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch events' });
    }
  },

  createEvent: async (req: AuthRequest, res: Response) => {
    try {
      const event = await eventService.createEvent(req.body, req.userId!);
      return res.status(201).json(event);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create event' });
    }
  },

  updateEvent: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = String(req.body.spaceId || req.query.spaceId || '');
      const event = await eventService.updateEvent(id, req.body, req.userId!, spaceId);
      return res.json(event);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update event' });
    }
  },

  getEventDates: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const month = (req.query.month as string) || '';
      const dates = await eventService.getEventDates(req.userId!, spaceId, month);
      return res.json(dates);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch event dates' });
    }
  },

  deleteEvent: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = String(req.query.spaceId || '');
      await eventService.deleteEvent(id, req.userId!, spaceId);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete event' });
    }
  },
};
