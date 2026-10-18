import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

// Route thử phân quyền, sẽ bỏ khi bắt đầu Bước 5
router.get('/admin-check', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Bạn là ADMIN' });
});

export default router;
