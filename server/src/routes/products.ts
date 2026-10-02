import { Router } from 'express';
import { apiErrorMessage } from '../utils/apiErrors.js';
import { getDb } from '../db.js';

const router = Router();

const listQuery = `
  SELECT p.*, b.name AS brand_name, c.name AS category_name
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

router.get('/', (req, res) => {
  const db = getDb();
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const barcode = typeof req.query.barcode === 'string' ? req.query.barcode.trim() : '';

  if (barcode) {
    const code = barcode.replace(/\s/g, '');
    const row = db
      .prepare(`${listQuery} WHERE p.barcode = ? OR upper(p.sku) = upper(?)`)
      .get(code, code);
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
    return;
  }

  if (q) {
    const like = `%${q}%`;
    const rows = db
      .prepare(
        `${listQuery}
         WHERE p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?
         ORDER BY p.name LIMIT 100`,
      )
      .all(like, like, like);
    res.json(rows);
    return;
  }

  const rows = db.prepare(`${listQuery} ORDER BY p.name`).all();
  res.json(rows);
});

router.get('/alerts/low-stock', (_req, res) => {
  const rows = getDb()
    .prepare(
      `${listQuery}
       WHERE p.low_stock_threshold > 0 AND p.stock_qty <= p.low_stock_threshold
       ORDER BY p.stock_qty ASC`,
    )
    .all();
  res.json({ count: rows.length, products: rows });
});

router.get('/:id', (req, res) => {
  const row = getDb()
    .prepare(`${listQuery} WHERE p.id = ?`)
    .get(Number(req.params.id));
  if (!row) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(row);
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const required = ['sku', 'name', 'price_cents'];
  for (const key of required) {
    if (body[key] === undefined || body[key] === '') {
      res.status(400).json({ error: `${key} is required` });
      return;
    }
  }

  try {
    const result = getDb()
      .prepare(
        `INSERT INTO products (sku, barcode, name, brand_id, category_id, cost_cents, price_cents, stock_qty, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        body.sku,
        body.barcode ?? null,
        body.name,
        body.brand_id ?? null,
        body.category_id ?? null,
        body.cost_cents ?? 0,
        body.price_cents,
        body.stock_qty ?? 0,
        body.low_stock_threshold ?? 0,
      );
    const row = getDb()
      .prepare(`${listQuery} WHERE p.id = ?`)
      .get(Number(result.lastInsertRowid));
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not create product.') });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const body = req.body ?? {};
  try {
    getDb()
      .prepare(
        `UPDATE products SET
          sku = ?,
          barcode = ?,
          name = ?,
          brand_id = ?,
          category_id = ?,
          cost_cents = ?,
          price_cents = ?,
          stock_qty = ?,
          low_stock_threshold = ?,
          updated_at = datetime('now')
         WHERE id = ?`,
      )
      .run(
        body.sku ?? (existing as { sku: string }).sku,
        body.barcode !== undefined ? body.barcode : (existing as { barcode: string | null }).barcode,
        body.name ?? (existing as { name: string }).name,
        body.brand_id !== undefined ? body.brand_id : (existing as { brand_id: number | null }).brand_id,
        body.category_id !== undefined
          ? body.category_id
          : (existing as { category_id: number | null }).category_id,
        body.cost_cents ?? (existing as { cost_cents: number }).cost_cents,
        body.price_cents ?? (existing as { price_cents: number }).price_cents,
        body.stock_qty ?? (existing as { stock_qty: number }).stock_qty,
        body.low_stock_threshold ??
          (existing as { low_stock_threshold: number }).low_stock_threshold,
        id,
      );
    const row = getDb()
      .prepare(`${listQuery} WHERE p.id = ?`)
      .get(id);
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not update product.') });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = getDb().prepare('DELETE FROM products WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ ok: true });
});

export default router;
