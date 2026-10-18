import { Router } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// Liveness: tiến trình còn sống, không kiểm tra DB
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Readiness: kiểm tra thêm kết nối database
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Health check DB lỗi:', err.message);
    res.status(503).json({
      status: 'error',
      database: 'down',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
