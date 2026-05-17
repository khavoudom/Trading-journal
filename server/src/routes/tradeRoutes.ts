import { Router } from 'express';
import { tradeController } from '@/controllers/tradeController.js';
import { authMiddleware } from '@/middleware/auth.js';

const router = Router();

router.use('/trades', authMiddleware);

router.get('/trades', tradeController.getAllTrades);
router.get('/trades/analytics/summary', tradeController.getAnalyticsSummary);
router.get('/trades/:id', tradeController.getTradeById);
router.post('/trades', tradeController.createTrade);
router.put('/trades/:id', tradeController.updateTrade);
router.delete('/trades/:id', tradeController.deleteTrade);

export default router;
