import express from 'express';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

app.use('/health', healthRoutes);

// 404: không khớp route nào
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
});

// Xử lý lỗi tập trung (phải có đủ 4 tham số)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ',
  });
});

export default app;
