import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.js';
import { notificationController } from '@/controllers/notificationController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.post('/generate-alerts', notificationController.generateAlerts);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
