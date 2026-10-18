import express from 'express';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);

// 404: không khớp route nào
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
});

// Xử lý lỗi tập trung (phải có đủ 4 tham số)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON không hợp lệ' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 ? 'Lỗi máy chủ' : err.message,
  });
});

export default app;
