import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.js';
import { templateController } from '@/controllers/templateController.js';

const router = Router();

// Template Types
router.get('/types', authMiddleware, templateController.getTypes);
router.post('/types', authMiddleware, templateController.createType);
router.delete('/types/:typeId', authMiddleware, templateController.deleteType);

// Templates
router.get('/', authMiddleware, templateController.getTemplates);
router.get('/:templateId', authMiddleware, templateController.getTemplate);
router.post('/', authMiddleware, templateController.createTemplate);
router.put('/:templateId', authMiddleware, templateController.updateTemplate);
router.delete('/:templateId', authMiddleware, templateController.deleteTemplate);

// Template Items
router.post('/:templateId/items', authMiddleware, templateController.addItem);
router.put('/items/:itemId', authMiddleware, templateController.updateItem);
router.delete('/items/:itemId', authMiddleware, templateController.deleteItem);

export default router;
