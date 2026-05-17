import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.js';
import { planController } from '@/controllers/planController.js';

const router = Router();

router.get('/', authMiddleware, planController.getPlan);
router.put('/', authMiddleware, planController.savePlan);

export default router;
