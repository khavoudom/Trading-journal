import { Router } from 'express';
import { uploadController } from '@/controllers/uploadController.js';
import { authMiddleware } from '@/middleware/auth.js';
import { upload } from '@/services/uploadService.js';

const router = Router();

router.use('/upload', authMiddleware);

router.post('/upload', upload.single('image'), uploadController.uploadImage);
router.post('/upload/multiple', upload.array('images', 10), uploadController.uploadMultiple);
router.delete('/upload/:filename', uploadController.deleteImage);

export default router;
