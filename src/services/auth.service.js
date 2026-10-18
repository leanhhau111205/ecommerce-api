import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const SALT_ROUNDS = 10;

function validateRegister({ username, fullname, password }) {
  const errors = [];
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.]{3,50}$/.test(username.trim())) {
    errors.push('username gồm 3-50 ký tự: chữ, số, dấu _ hoặc .');
  }
  if (typeof fullname !== 'string' || fullname.trim().length < 1 || fullname.trim().length > 100) {
    errors.push('fullname gồm 1-100 ký tự');
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
    errors.push('password dài 8-72 ký tự');
  }
  if (errors.length) throw new HttpError(400, errors.join('; '));
}

function signToken(user, rolename) {
  return jwt.sign({ role: rolename }, env.jwtSecret, {
    subject: String(user.uid),
    expiresIn: env.jwtExpiresIn,
  });
}

export async function register(body = {}) {
  validateRegister(body);

  const role = await prisma.role.findUnique({ where: { rolename: 'CUSTOMER' } });
  const membership = await prisma.memberShip.findUnique({ where: { mname: 'Standard' } });
  if (!role || !membership) {
    throw new HttpError(500, 'Chưa có dữ liệu khởi tạo, hãy chạy: npm run db:seed');
  }

  const hash = await bcrypt.hash(body.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username.trim(),
        fullname: body.fullname.trim(),
        password: hash,
        roleid: role.roleid,
        mid: membership.mid,
      },
    });
    return {
      uid: user.uid,
      username: user.username,
      fullname: user.fullname,
      role: role.rolename,
      membership: membership.mname,
    };
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Username đã tồn tại');
    }
    throw err;
  }
}

export async function login(body = {}) {
  const { username, password } = body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Cần cung cấp username và password');
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
    include: { role: true },
  });

  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) {
    throw new HttpError(401, 'Sai tên đăng nhập hoặc mật khẩu');
  }

  return {
    token: signToken(user, user.role.rolename),
    user: { uid: user.uid, username: user.username, fullname: user.fullname, role: user.role.rolename },
  };
}

export async function getProfile(uid) {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: {
      uid: true,
      username: true,
      fullname: true,
      role: { select: { rolename: true } },
      membership: { select: { mname: true, score: true } },
    },
  });
  if (!user) throw new HttpError(404, 'Không tìm thấy người dùng');
  return user;
}
