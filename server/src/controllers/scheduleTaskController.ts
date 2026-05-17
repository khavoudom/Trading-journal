import { Response } from 'express';
import { scheduleTaskService } from '@/services/scheduleTaskService.js';
import { AuthRequest } from '@/middleware/auth.js';

export const scheduleTaskController = {
  getTasksByMonth: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const month = (req.query.month as string) || '';
      const tasks = await scheduleTaskService.getTasksByMonth(req.userId!, spaceId, month);
      return res.json(tasks);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch tasks' });
    }
  },

  getTasksByDate: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const date = (req.query.date as string) || '';
      const tasks = await scheduleTaskService.getTasksByDate(req.userId!, spaceId, date);
      return res.json(tasks);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch tasks' });
    }
  },

  createTask: async (req: AuthRequest, res: Response) => {
    try {
      const task = await scheduleTaskService.createTask(req.body, req.userId!);
      return res.status(201).json(task);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create task' });
    }
  },

  createRepeatingTasks: async (req: AuthRequest, res: Response) => {
    try {
      const { repeatType, repeatEnd, customDays, ...taskData } = req.body;
      const tasks = await scheduleTaskService.createRepeatingTasks(
        taskData,
        repeatType,
        repeatEnd,
        customDays,
        req.userId!,
      );
      return res.status(201).json(tasks);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ error: error.message || 'Failed to create repeating tasks' });
    }
  },

  updateTask: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = String(req.body.spaceId || req.query.spaceId || '');
      const task = await scheduleTaskService.updateTask(id, req.body, req.userId!, spaceId);
      return res.json(task);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update task' });
    }
  },

  deleteTask: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = String(req.query.spaceId || '');
      await scheduleTaskService.deleteTask(id, req.userId!, spaceId);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete task' });
    }
  },

  generateMonth: async (req: AuthRequest, res: Response) => {
    try {
      const tasks = await scheduleTaskService.generateMonth(req.body, req.userId!);
      return res.status(201).json(tasks);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to generate month' });
    }
  },
};
