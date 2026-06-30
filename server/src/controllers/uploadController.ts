import { Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { AuthRequest } from '@/middleware/auth.js';
import { config } from '@/config/index.js';
import { AppError } from '@/errors/AppError.js';

/** Handles image upload and deletion for trade screenshots. */
export const uploadController = {
  /**
   * Uploads a single image.
   * POST /api/upload
   */
  uploadImage: async (req: AuthRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError('No file provided', 400);
      }
      return res.status(201).json({ url: `/uploads/${file.filename}` });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to upload image' });
    }
  },

  /**
   * Uploads multiple images at once.
   * POST /api/upload/multiple
   */
  uploadMultiple: async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError('No files provided', 400);
      }
      const urls = files.map((f) => `/uploads/${f.filename}`);
      return res.status(201).json({ urls });
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to upload images' });
    }
  },

  /**
   * Deletes an uploaded image by filename.
   * DELETE /api/upload/:filename
   */
  deleteImage: async (req: AuthRequest, res: Response) => {
    try {
      const { filename } = req.params;
      if (!filename) {
        throw new AppError('Filename is required', 400);
      }

      const safeName = path.basename(filename as string);
      const filePath = path.join(config.uploadDir, safeName);

      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found', 404);
      }

      fs.unlinkSync(filePath);
      return res.status(204).send();
    } catch (error: any) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message || 'Failed to delete image' });
    }
  },
};
