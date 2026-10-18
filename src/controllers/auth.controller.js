import * as authService from '../services/auth.service.js';

export async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json({ message: 'Đăng ký thành công', user });
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function me(req, res) {
  const user = await authService.getProfile(req.user.uid);
  res.json({ user });
}
