import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

// Yêu cầu header: Authorization: Bearer <token>
export function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Thiếu token xác thực');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Token không hợp lệ hoặc đã hết hạn');
  }

  req.user = { uid: Number(payload.sub), role: payload.role };
  next();
}

// Dùng sau authenticate: authorize('ADMIN')
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, 'Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };
