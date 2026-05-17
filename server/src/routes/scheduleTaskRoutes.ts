import { Router } from 'express';
import { scheduleTaskController } from '@/controllers/scheduleTaskController.js';
import { authMiddleware } from '@/middleware/auth.js';

const router = Router();

router.use('/schedule-tasks', authMiddleware);

router.get('/schedule-tasks', scheduleTaskController.getTasksByMonth);
router.get('/schedule-tasks/date', scheduleTaskController.getTasksByDate);
router.post('/schedule-tasks', scheduleTaskController.createTask);
router.post('/schedule-tasks/repeat', scheduleTaskController.createRepeatingTasks);
router.post('/schedule-tasks/generate', scheduleTaskController.generateMonth);
router.put('/schedule-tasks/:id', scheduleTaskController.updateTask);
router.delete('/schedule-tasks/:id', scheduleTaskController.deleteTask);

export default router;
