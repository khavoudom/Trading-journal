import multer from 'multer';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config/index.js';
import { AppError } from '@/errors/AppError.js';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, GIF, and WebP images are allowed', 400));
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
