import { Response } from 'express';
import { tradeService } from '@/services/tradeService.js';
import { AuthRequest } from '@/middleware/auth.js';

/** Handles CRUD operations and analytics for trades. */
export const tradeController = {
  /**
   * Returns all trades for the authenticated user within a space.
   * GET /api/trades?spaceId=...
   */
  getAllTrades: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const trades = await tradeService.getAllTrades(req.userId!, spaceId);
      return res.json(trades);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch trades' });
    }
  },

  /**
   * Returns a single trade by ID.
   * GET /api/trades/:id?spaceId=...
   */
  getTradeById: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const spaceId = (req.query.spaceId as string) || '';
      const trade = await tradeService.getTradeById(id as string, req.userId!, spaceId);

      if (!trade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      return res.json(trade);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch trade' });
    }
  },

  /**
   * Creates a new trade.
   * POST /api/trades
   */
  createTrade: async (req: AuthRequest, res: Response) => {
    try {
      const newTrade = await tradeService.createTrade(req.body, req.userId!);
      return res.status(201).json(newTrade);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create trade' });
    }
  },

  /**
   * Updates an existing trade.
   * PUT /api/trades/:id
   */
  updateTrade: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const spaceId = req.body.spaceId || '';

      const updatedTrade = await tradeService.updateTrade(
        id as string,
        req.body,
        req.userId!,
        spaceId,
      );

      if (!updatedTrade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      return res.json(updatedTrade);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update trade' });
    }
  },

  /**
   * Deletes a trade by ID.
   * DELETE /api/trades/:id?spaceId=...
   */
  deleteTrade: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const spaceId = (req.query.spaceId as string) || '';

      const success = await tradeService.deleteTrade(id as string, req.userId!, spaceId);

      if (!success) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete trade' });
    }
  },

  /**
   * Returns an analytics summary (win rate, P&L, best/worst trade) for the user's trades.
   * GET /api/trades/analytics/summary?spaceId=...
   */
  getAnalyticsSummary: async (req: AuthRequest, res: Response) => {
    try {
      const spaceId = (req.query.spaceId as string) || '';
      const summary = await tradeService.getAnalyticsSummary(req.userId!, spaceId);
      return res.json(summary);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch analytics' });
    }
  },
};
