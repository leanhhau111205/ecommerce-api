import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

const MAX_INT = 2147483647;
const PRICE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

export function parseId(value) {
  if (!/^\d+$/.test(String(value))) {
    throw new HttpError(400, 'id phải là số nguyên dương');
  }
  const id = Number(value);
  if (id < 1 || id > MAX_INT) {
    throw new HttpError(400, 'id phải là số nguyên dương');
  }
  return id;
}

function normalizePrice(price) {
  const text = typeof price === 'number' ? String(price) : price;
  if (typeof text !== 'string' || !PRICE_PATTERN.test(text)) return null;
  return text;
}

// requireAll = true (tạo mới): bắt buộc pname và price, quantity tùy chọn
// requireAll = false (cập nhật): chỉ kiểm tra các trường được gửi lên
function validateFields(body, { requireAll }) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'Body phải là một đối tượng JSON');
  }

  const data = {};
  const errors = [];

  if (body.pname !== undefined || requireAll) {
    const name = typeof body.pname === 'string' ? body.pname.trim() : '';
    if (name.length < 1 || name.length > 100) {
      errors.push('pname gồm 1-100 ký tự');
    } else {
      data.pname = name;
    }
  }

  if (body.price !== undefined || requireAll) {
    const price = normalizePrice(body.price);
    if (price === null) {
      errors.push('price là số không âm, tối đa 8 chữ số nguyên và 2 chữ số thập phân');
    } else {
      data.price = price;
    }
  }

  if (body.quantity !== undefined) {
    if (!Number.isInteger(body.quantity) || body.quantity < 0 || body.quantity > MAX_INT) {
      errors.push('quantity là số nguyên từ 0 trở lên');
    } else {
      data.quantity = body.quantity;
    }
  }

  if (errors.length) throw new HttpError(400, errors.join('; '));
  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Cần ít nhất một trường: pname, price, quantity');
  }
  return data;
}

export async function list(query = {}) {
  const page = Math.min(Math.max(parseInt(query.page, 10) || 1, 1), 100000);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
  const where = q ? { pname: { contains: q, mode: 'insensitive' } } : {};

  const [total, data] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { pid: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id) {
  const product = await prisma.product.findUnique({ where: { pid: id } });
  if (!product) throw new HttpError(404, 'Không tìm thấy sản phẩm');
  return product;
}

export async function create(body) {
  const data = validateFields(body, { requireAll: true });
  return prisma.product.create({ data });
}

export async function update(id, body) {
  const data = validateFields(body, { requireAll: false });
  try {
    return await prisma.product.update({ where: { pid: id }, data });
  } catch (err) {
    if (err.code === 'P2025') throw new HttpError(404, 'Không tìm thấy sản phẩm');
    throw err;
  }
}

export async function remove(id) {
  try {
    await prisma.product.delete({ where: { pid: id } });
  } catch (err) {
    if (err.code === 'P2025') throw new HttpError(404, 'Không tìm thấy sản phẩm');
    if (err.code === 'P2003') {
      throw new HttpError(409, 'Không thể xóa sản phẩm đã có trong đơn hàng');
    }
    throw err;
  }
}
