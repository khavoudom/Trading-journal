import { Response } from 'express';
import { settingService } from '@/services/settingService.js';
import type { AuthRequest } from '@/middleware/auth.js';

export const settingController = {
  get: async (req: AuthRequest, res: Response) => {
    try {
      const key = (req.query.key as string) || '';
      const spaceId = req.query.spaceId as string | undefined;

      const value = await settingService.get(req.userId!, key, spaceId);
      if (value === null) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      return res.json({ key, value });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to get setting' });
    }
  },

  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = req.query.spaceId as string | undefined;
      const settings = await settingService.getAll(req.userId!, spaceId);
      return res.json(settings);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to get settings' });
    }
  },

  set: async (req: AuthRequest, res: Response) => {
    try {
      const setting = await settingService.set(req.userId!, req.body);
      return res.json(setting);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to set setting' });
    }
  },

  remove: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await settingService.remove(req.userId!, id as string);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete setting' });
    }
  },
};
