import { Router } from 'express';
import tradeRoutes from './tradeRoutes.js';
import authRoutes from './authRoutes.js';
import planRoutes from './planRoutes.js';
import spaceRoutes from './spaceRoutes.js';
import riskRuleRoutes from './riskRuleRoutes.js';
import templateRoutes from './templateRoutes.js';
import eventRoutes from './eventRoutes.js';
import drawingRoutes from './drawingRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import scheduleTaskRoutes from './scheduleTaskRoutes.js';
import priceRoutes from './priceRoutes.js';
import settingRoutes from './settingRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/api', tradeRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/plan', planRoutes);
router.use('/api', spaceRoutes);
router.use('/api/risk-rules', riskRuleRoutes);
router.use('/api/templates', templateRoutes);
router.use('/api', eventRoutes);
router.use('/api', drawingRoutes);
router.use('/api', uploadRoutes);
router.use('/api', scheduleTaskRoutes);
router.use('/api', priceRoutes);
router.use('/api/settings', settingRoutes);
router.use('/api/notifications', notificationRoutes);

export default router;
