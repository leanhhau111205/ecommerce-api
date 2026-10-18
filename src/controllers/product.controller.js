import * as productService from '../services/product.service.js';

export async function list(req, res) {
  res.json(await productService.list(req.query));
}

export async function getOne(req, res) {
  const product = await productService.getById(productService.parseId(req.params.id));
  res.json({ product });
}

export async function create(req, res) {
  const product = await productService.create(req.body);
  res.status(201).json({ message: 'Tạo sản phẩm thành công', product });
}

export async function update(req, res) {
  const product = await productService.update(
    productService.parseId(req.params.id),
    req.body,
  );
  res.json({ message: 'Cập nhật sản phẩm thành công', product });
}

export async function remove(req, res) {
  await productService.remove(productService.parseId(req.params.id));
  res.status(204).end();
}
