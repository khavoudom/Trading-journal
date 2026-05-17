import { Response } from 'express';
import { spaceService } from '@/services/spaceService.js';
import type { AuthRequest } from '@/middleware/auth.js';

/** Handles CRUD operations for trading spaces. */
export const spaceController = {
  /**
   * Returns all spaces for the authenticated user.
   * GET /api/spaces
   */
  getSpaces: async (req: AuthRequest, res: Response) => {
    try {
      const spaces = await spaceService.getSpaces(req.userId!);
      return res.json(spaces);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to fetch spaces' });
    }
  },

  /**
   * Creates a new trading space.
   * POST /api/spaces
   */
  createSpace: async (req: AuthRequest, res: Response) => {
    try {
      const { name } = req.body;
      const newSpace = await spaceService.createSpace(req.userId!, name);
      return res.status(201).json(newSpace);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to create space' });
    }
  },

  /**
   * Renames an existing space.
   * PATCH /api/spaces/:id
   */
  renameSpace: async (req: AuthRequest, res: Response) => {
    try {
      const { name } = req.body;
      const updated = await spaceService.renameSpace(req.userId!, req.params.id as string, name);
      return res.json(updated);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to rename space' });
    }
  },

  /**
   * Deletes a space and all associated trades and plan data.
   * Requires password confirmation.
   * POST /api/spaces/:id/delete
   */
  deleteSpace: async (req: AuthRequest, res: Response) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required to delete a space' });
      }
      await spaceService.deleteSpace(req.userId!, req.params.id as string, password);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete space' });
    }
  },
};
