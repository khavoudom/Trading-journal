import { Response } from 'express';
import { drawingService } from '@/services/drawingService.js';
import { AuthRequest } from '@/middleware/auth.js';

export const drawingController = {
  getAllDrawings: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const drawings = await drawingService.getAllDrawings(req.userId!, spaceId);
      return res.json(drawings);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch drawings' });
    }
  },

  getDrawingsByDate: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const date = (req.query.date as string) || '';
      const drawings = await drawingService.getDrawingsByDate(req.userId!, spaceId, date);
      return res.json(drawings);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch drawings' });
    }
  },

  getDrawing: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = (req.query.spaceId as string) || '';
      const drawing = await drawingService.getDrawing(id, req.userId!, spaceId);
      return res.json(drawing);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch drawing' });
    }
  },

  createDrawing: async (req: AuthRequest, res: Response) => {
    try {
      const drawing = await drawingService.createDrawing(req.body, req.userId!);
      return res.status(201).json(drawing);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create drawing' });
    }
  },

  updateDrawing: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = String(req.body.spaceId || req.query.spaceId || '');
      const drawing = await drawingService.updateDrawing(id, req.body, req.userId!, spaceId);
      return res.json(drawing);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update drawing' });
    }
  },

  deleteDrawing: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const spaceId = String(req.query.spaceId || '');
      await drawingService.deleteDrawing(id, req.userId!, spaceId);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete drawing' });
    }
  },
};
