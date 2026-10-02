import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function escapeCsv(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

router.get('/accounting.csv', (req, res) => {
  const from =
    typeof req.query.from === 'string' ? req.query.from : new Date().toISOString().slice(0, 10);
  const to = typeof req.query.to === 'string' ? req.query.to : from;
  const rows = getDb()
    .prepare(
      `SELECT s.receipt_number, s.created_at, s.payment_method, s.payment_reference,
              sl.label, sl.qty, sl.unit_price_cents, sl.line_total_cents, sl.is_open_price,
              p.sku, c.name AS customer_name
       FROM sale_lines sl
       JOIN sales s ON s.id = sl.sale_id
       LEFT JOIN products p ON p.id = sl.product_id
       LEFT JOIN customers c ON c.id = s.customer_id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)
       ORDER BY s.created_at, s.receipt_number, sl.id`,
    )
    .all(from, to) as Record<string, unknown>[];

  const header = [
    'receipt_number',
    'created_at',
    'payment_method',
    'payment_reference',
    'sku',
    'label',
    'qty',
    'unit_price_cents',
    'line_total_cents',
    'is_open_price',
    'customer_name',
  ].join(',');

  const lines = rows.map((r) =>
    [
      r.receipt_number,
      r.created_at,
      r.payment_method,
      r.payment_reference,
      r.sku,
      r.label,
      r.qty,
      r.unit_price_cents,
      r.line_total_cents,
      r.is_open_price,
      r.customer_name,
    ]
      .map((v) => escapeCsv(v as string | number | null | undefined))
      .join(','),
  );

  const csv = [header, ...lines].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="accounting-${from}-${to}.csv"`);
  res.send(csv);
});

router.get('/summary.json', (req, res) => {
  const from =
    typeof req.query.from === 'string' ? req.query.from : new Date().toISOString().slice(0, 10);
  const to = typeof req.query.to === 'string' ? req.query.to : from;
  const db = getDb();

  const totals = db
    .prepare(
      `SELECT COUNT(*) AS sale_count, COALESCE(SUM(total_cents), 0) AS total_cents
       FROM sales WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)`,
    )
    .get(from, to);

  const paymentMix = db
    .prepare(
      `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total_cents), 0) AS total_cents
       FROM sales WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)
       GROUP BY payment_method`,
    )
    .all(from, to);

  res.json({
    from,
    to,
    generated_at: new Date().toISOString(),
    totals,
    payment_mix: paymentMix,
  });
});

export default router;
