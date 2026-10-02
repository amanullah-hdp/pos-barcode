import { Router } from 'express';
import { apiErrorMessage } from '../utils/apiErrors.js';
import { checkout, reopenDay, type CheckoutPayload } from '../services/checkout.js';
import { updateSaleDiscounts, type UpdateDiscountsPayload } from '../services/saleDiscounts.js';
import { getDb } from '../db.js';
import { saleLinesForReceipt } from '../utils/saleLinesDto.js';
import { settingsForClient } from '../utils/settingsDto.js';

const router = Router();

function receiptPayload(sale: unknown, saleId: number) {
  const db = getDb();
  const lines = saleLinesForReceipt(db, saleId);
  const saleRow = sale as { customer_id: number | null };
  let customer_name: string | null = null;
  if (saleRow.customer_id) {
    const c = db.prepare('SELECT name FROM customers WHERE id = ?').get(saleRow.customer_id) as
      | { name: string }
      | undefined;
    customer_name = c?.name ?? null;
  }
  return { sale, lines, settings: settingsForClient(), customer_name };
}

router.get('/', (req, res) => {
  const from =
    typeof req.query.from === 'string' ? req.query.from : new Date().toISOString().slice(0, 10);
  const to = typeof req.query.to === 'string' ? req.query.to : from;
  const staffFilter =
    typeof req.query.staff_id === 'string' && req.query.staff_id.trim()
      ? Number(req.query.staff_id)
      : null;
  const params: (string | number)[] = [from, to];
  let staffClause = '';
  if (staffFilter != null && Number.isInteger(staffFilter) && staffFilter > 0) {
    staffClause = ' AND s.staff_id = ?';
    params.push(staffFilter);
  }
  const rows = getDb()
    .prepare(
      `SELECT s.id, s.receipt_number, s.total_cents, s.payment_method, s.created_at,
              s.staff_id, s.staff_code, s.staff_name,
              c.name AS customer_name
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)${staffClause}
       ORDER BY s.created_at DESC
       LIMIT 200`,
    )
    .all(...params);
  res.json(rows);
});

router.get('/receipt/:receiptNumber', (req, res) => {
  const receiptNumber = Number(req.params.receiptNumber);
  const sale = getDb().prepare('SELECT * FROM sales WHERE receipt_number = ?').get(receiptNumber);
  if (!sale) {
    res.status(404).json({ error: 'Receipt not found' });
    return;
  }
  const id = (sale as { id: number }).id;
  res.json(receiptPayload(sale, id));
});

router.post('/checkout', (req, res) => {
  try {
    const result = checkout(req.body as CheckoutPayload);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Checkout could not be completed.') });
  }
});

router.post('/reopen-day', (_req, res) => {
  reopenDay();
  res.json({ ok: true });
});

router.patch('/:id/discounts', (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = updateSaleDiscounts(id, req.body as UpdateDiscountsPayload);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not update discounts.') });
  }
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const sale = getDb().prepare('SELECT * FROM sales WHERE id = ?').get(id);
  if (!sale) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(receiptPayload(sale, id));
});

export default router;
