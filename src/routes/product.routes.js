import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', productController.list);
router.get('/:id', productController.getOne);

router.post('/', authenticate, authorize('ADMIN'), productController.create);
router.patch('/:id', authenticate, authorize('ADMIN'), productController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.remove);

export default router;
