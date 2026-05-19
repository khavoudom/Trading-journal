import { Response } from 'express';
import { templateService } from '@/services/templateService.js';
import type { AuthRequest } from '@/middleware/auth.js';

/** Handles CRUD for templates, template types, and template items. */
export const templateController = {
  // ---- Template Types ----

  getTypes: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const result = await templateService.getTypes(req.userId!, spaceId);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch template types' });
    }
  },

  createType: async (req: AuthRequest, res: Response) => {
    try {
      const result = await templateService.createType(req.userId!, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create template type' });
    }
  },

  deleteType: async (req: AuthRequest, res: Response) => {
    try {
      const typeId = req.params.typeId as string;
      await templateService.deleteType(req.userId!, typeId);
      return res.json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete template type' });
    }
  },

  updateType: async (req: AuthRequest, res: Response) => {
    try {
      const typeId = req.params.typeId as string;
      const result = await templateService.updateType(req.userId!, typeId, req.body);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update template type' });
    }
  },

  // ---- Templates ----

  getTemplates: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const typeId = (req.query.typeId as string) || undefined;
      const result = await templateService.getTemplates(req.userId!, spaceId, typeId);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch templates' });
    }
  },

  getTemplate: async (req: AuthRequest, res: Response) => {
    try {
      const templateId = req.params.templateId as string;
      const result = await templateService.getTemplate(req.userId!, templateId);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch template' });
    }
  },

  createTemplate: async (req: AuthRequest, res: Response) => {
    try {
      const result = await templateService.createTemplate(req.userId!, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create template' });
    }
  },

  updateTemplate: async (req: AuthRequest, res: Response) => {
    try {
      const templateId = req.params.templateId as string;
      await templateService.updateTemplate(req.userId!, templateId, req.body);
      return res.json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update template' });
    }
  },

  deleteTemplate: async (req: AuthRequest, res: Response) => {
    try {
      const templateId = req.params.templateId as string;
      await templateService.deleteTemplate(req.userId!, templateId);
      return res.json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete template' });
    }
  },

  // ---- Template Items ----

  addItem: async (req: AuthRequest, res: Response) => {
    try {
      const templateId = req.params.templateId as string;
      const result = await templateService.addItem(req.userId!, templateId, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to add template item' });
    }
  },

  updateItem: async (req: AuthRequest, res: Response) => {
    try {
      const itemId = req.params.itemId as string;
      await templateService.updateItem(req.userId!, itemId, req.body);
      return res.json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update template item' });
    }
  },

  deleteItem: async (req: AuthRequest, res: Response) => {
    try {
      const itemId = req.params.itemId as string;
      await templateService.deleteItem(req.userId!, itemId);
      return res.json({ success: true });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete template item' });
    }
  },
};
