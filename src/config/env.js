import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET phải dài ít nhất 32 ký tự');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
