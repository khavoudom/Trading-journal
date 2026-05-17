import { Response } from 'express';
import { authService } from '@/services/authService.js';
import type { AuthRequest } from '@/middleware/auth.js';
import { logger } from '@/utils/logger.js';

/** Handles user registration, login, profile retrieval, and profile update requests. */
export const authController = {
  /**
   * Registers a new user account.
   * POST /api/auth/register
   */
  register: async (req: AuthRequest, res: Response) => {
    logger.info('AuthController', 'Register request received', req.body?.email);
    try {
      const result = await authService.register(req.body);
      logger.info('AuthController', 'Register successful', result.user?.id);
      return res.status(201).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      logger.error('AuthController', `Register failed (${status})`, error.message);
      return res.status(status).json({ error: error.message || 'Failed to register user' });
    }
  },

  /**
   * Authenticates a user and returns a JWT token.
   * POST /api/auth/login
   */
  login: async (req: AuthRequest, res: Response) => {
    logger.info('AuthController', 'Login request received', req.body?.email);
    try {
      const result = await authService.login(req.body);
      logger.info('AuthController', 'Login request successful', req.body?.email);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      logger.error('AuthController', `Login request failed (${status})`, error.message);
      return res.status(status).json({ error: error.message || 'Failed to login' });
    }
  },

  /**
   * Returns the authenticated user's profile.
   * GET /api/auth/profile (authenticated)
   */
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const result = await authService.getProfile(req.userId);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to fetch profile' });
    }
  },

  /**
   * Updates the authenticated user's profile (username, email, password).
   * PATCH /api/auth/profile (authenticated)
   */
  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const result = await authService.updateProfile(req.userId, req.body);
      return res.json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to update profile' });
    }
  },

  /**
   * Deletes the authenticated user's account and all associated data.
   * POST /api/auth/delete (authenticated)
   */
  deleteAccount: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      const valid = await authService.verifyPassword(req.userId, password);
      if (!valid) {
        return res.status(403).json({ error: 'Password is incorrect' });
      }
      await authService.deleteAccount(req.userId);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete account' });
    }
  },
};
