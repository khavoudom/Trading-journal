import { Response } from 'express';
import { riskRuleService } from '@/services/riskRuleService.js';
import type { AuthRequest } from '@/middleware/auth.js';

export const riskRuleController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const rules = await riskRuleService.getAll(req.userId!, spaceId);
      return res.json(rules);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch risk rules' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const rule = await riskRuleService.create(req.userId!, req.body);
      return res.status(201).json(rule);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create risk rule' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const rule = await riskRuleService.update(req.userId!, id as string, req.body);
      return res.json(rule);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update risk rule' });
    }
  },

  remove: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await riskRuleService.remove(req.userId!, id as string);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete risk rule' });
    }
  },
};
