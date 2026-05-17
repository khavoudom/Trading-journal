import { Router } from 'express';
import { drawingController } from '@/controllers/drawingController.js';
import { calendarDrawingController } from '@/controllers/calendarDrawingController.js';
import { authMiddleware } from '@/middleware/auth.js';

const router = Router();

router.use('/drawings', authMiddleware);
router.use('/calendar-drawings', authMiddleware);

router.get('/drawings', drawingController.getDrawingsByDate);
router.get('/drawings/all', drawingController.getAllDrawings);
router.get('/drawings/:id', drawingController.getDrawing);
router.post('/drawings', drawingController.createDrawing);
router.put('/drawings/:id', drawingController.updateDrawing);
router.delete('/drawings/:id', drawingController.deleteDrawing);

router.get('/calendar-drawings', calendarDrawingController.getDrawingsByDate);
router.get('/calendar-drawings/all', calendarDrawingController.getAllDrawings);
router.get('/calendar-drawings/dates', calendarDrawingController.getDrawingDates);
router.get('/calendar-drawings/:id', calendarDrawingController.getDrawing);
router.post('/calendar-drawings', calendarDrawingController.createDrawing);
router.put('/calendar-drawings/:id', calendarDrawingController.updateDrawing);
router.delete('/calendar-drawings/:id', calendarDrawingController.deleteDrawing);

export default router;
