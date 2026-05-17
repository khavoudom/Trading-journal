import { Router } from 'express';
import { priceController } from '@/controllers/priceController.js';

const router = Router();

router.get('/prices', priceController.getAllPrices);
router.get('/prices/:symbol', priceController.getPriceBySymbol);

export default router;
