import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.js';
import { spaceController } from '@/controllers/spaceController.js';

const router = Router();

router.get('/spaces', authMiddleware, spaceController.getSpaces);
router.post('/spaces', authMiddleware, spaceController.createSpace);
router.patch('/spaces/:id', authMiddleware, spaceController.renameSpace);
router.post('/spaces/:id/delete', authMiddleware, spaceController.deleteSpace);

export default router;
