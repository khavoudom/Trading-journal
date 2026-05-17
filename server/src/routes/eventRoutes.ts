import { Router } from 'express';
import { eventController } from '@/controllers/eventController.js';
import { authMiddleware } from '@/middleware/auth.js';

const router = Router();

router.use('/events', authMiddleware);

router.get('/events', eventController.getEventsByDate);
router.get('/events/dates', eventController.getEventDates);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

export default router;
