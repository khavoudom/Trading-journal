import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.js';
import { settingController } from '@/controllers/settingController.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  if (req.query.key) {
    return settingController.get(req, res);
  }
  return settingController.getAll(req, res);
});
router.post('/', authMiddleware, settingController.set);
router.delete('/:id', authMiddleware, settingController.remove);

export default router;
