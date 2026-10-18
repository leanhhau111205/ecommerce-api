import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`Server chạy tại http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  console.log(`Nhận ${signal}, đang tắt server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Ép thoát nếu quá 10 giây vẫn chưa đóng xong
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
