import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM customers ORDER BY name').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const customer = getDb().prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const sales = getDb()
    .prepare('SELECT * FROM sales WHERE customer_id = ? ORDER BY created_at DESC')
    .all(id);
  res.json({ customer, sales });
});

router.post('/', (req, res) => {
  const { name, phone, email } = req.body ?? {};
  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const result = getDb()
    .prepare('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)')
    .run(name.trim(), phone?.trim() || null, email?.trim() || null);
  const row = getDb()
    .prepare('SELECT * FROM customers WHERE id = ?')
    .get(Number(result.lastInsertRowid));
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = getDb().prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const { name, phone, email } = req.body ?? {};
  getDb()
    .prepare('UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?')
    .run(
      name?.trim() ?? (existing as { name: string }).name,
      phone !== undefined ? phone?.trim() || null : (existing as { phone: string | null }).phone,
      email !== undefined ? email?.trim() || null : (existing as { email: string | null }).email,
      id,
    );
  const row = getDb().prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = getDb().prepare('DELETE FROM customers WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ ok: true });
});

export default router;
