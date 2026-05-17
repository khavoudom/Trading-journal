import { Response } from 'express';
import { notificationService } from '@/services/notificationService.js';
import { AuthRequest } from '@/middleware/auth.js';

export const notificationController = {
  getNotifications: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const unreadOnly = req.query.unread === 'true';
      const notifications = unreadOnly
        ? await notificationService.getUnreadBySpace(req.userId!, spaceId)
        : await notificationService.getBySpace(req.userId!, spaceId);
      return res.json(notifications);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch notifications' });
    }
  },

  createNotification: async (req: AuthRequest, res: Response) => {
    try {
      const notification = await notificationService.create(req.body, req.userId!);
      return res.status(201).json(notification);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create notification' });
    }
  },

  markAsRead: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const notification = await notificationService.markAsRead(id, req.userId!);
      return res.json(notification);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to mark as read' });
    }
  },

  markAllRead: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = String(req.body.spaceId || req.query.spaceId || '');
      await notificationService.markAllRead(req.userId!, spaceId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to mark all as read' });
    }
  },

  deleteNotification: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      await notificationService.delete(id, req.userId!);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete notification' });
    }
  },

  generateAlerts: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = String(req.body.spaceId || req.query.spaceId || '');
      if (!spaceId) {
        return res.status(400).json({ error: 'spaceId is required' });
      }
      await notificationService.generateAlerts(req.userId!, spaceId);
      return res.json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to generate alerts' });
    }
  },
};
