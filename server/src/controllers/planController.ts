import { Response } from 'express';
import { planService } from '@/services/planService.js';
import type { AuthRequest } from '@/middleware/auth.js';

/** Handles retrieval and saving of the user's trading plan. */
export const planController = {
  /**
   * Returns the trading plan for the current user and space.
   * GET /api/plan?spaceId=...
   */
  getPlan: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const result = await planService.getPlan(req.userId!, spaceId);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch plan' });
    }
  },

  /**
   * Saves (upserts) the trading plan for the current user and space.
   * PUT /api/plan
   */
  savePlan: async (req: AuthRequest, res: Response) => {
    try {
      const result = await planService.savePlan(req.userId!, req.body);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to save plan' });
    }
  },
};
