import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.js';
import { riskRuleController } from '@/controllers/riskRuleController.js';

const router = Router();

router.get('/', authMiddleware, riskRuleController.getAll);
router.post('/', authMiddleware, riskRuleController.create);
router.put('/:id', authMiddleware, riskRuleController.update);
router.delete('/:id', authMiddleware, riskRuleController.remove);

export default router;
