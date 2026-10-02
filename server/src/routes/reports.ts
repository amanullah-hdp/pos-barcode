import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function dateRange(req: { query: Record<string, unknown> }) {
  const from =
    typeof req.query.from === 'string' ? req.query.from : new Date().toISOString().slice(0, 10);
  const to = typeof req.query.to === 'string' ? req.query.to : from;
  return { from, to };
}

router.get('/daily', (req, res) => {
  const { from, to } = dateRange(req);
  const db = getDb();

  const summary = db
    .prepare(
      `SELECT COUNT(*) AS sale_count, COALESCE(SUM(total_cents), 0) AS total_cents
       FROM sales WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)`,
    )
    .get(from, to) as { sale_count: number; total_cents: number };

  const paymentMix = db
    .prepare(
      `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total_cents), 0) AS total_cents
       FROM sales WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)
       GROUP BY payment_method`,
    )
    .all(from, to);

  const byCategory = db
    .prepare(
      `SELECT COALESCE(c.name, 'Uncategorized') AS name,
              SUM(sl.line_total_cents) AS total_cents,
              SUM(sl.qty) AS qty
       FROM sale_lines sl
       JOIN sales s ON s.id = sl.sale_id
       LEFT JOIN products p ON p.id = sl.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)
       GROUP BY c.id
       ORDER BY total_cents DESC`,
    )
    .all(from, to);

  const byBrand = db
    .prepare(
      `SELECT COALESCE(b.name, 'No brand') AS name,
              SUM(sl.line_total_cents) AS total_cents,
              SUM(sl.qty) AS qty
       FROM sale_lines sl
       JOIN sales s ON s.id = sl.sale_id
       LEFT JOIN products p ON p.id = sl.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)
       GROUP BY b.id
       ORDER BY total_cents DESC`,
    )
    .all(from, to);

  const byProduct = db
    .prepare(
      `SELECT COALESCE(p.name, sl.label) AS name,
              COALESCE(p.sku, '') AS sku,
              SUM(sl.line_total_cents) AS total_cents,
              SUM(sl.qty) AS qty
       FROM sale_lines sl
       JOIN sales s ON s.id = sl.sale_id
       LEFT JOIN products p ON p.id = sl.product_id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)
       GROUP BY COALESCE(p.id, sl.id)
       ORDER BY total_cents DESC
       LIMIT 100`,
    )
    .all(from, to);

  res.json({
    from,
    to,
    summary,
    payment_mix: paymentMix,
    by_category: byCategory,
    by_brand: byBrand,
    by_product: byProduct,
  });
});

export default router;
