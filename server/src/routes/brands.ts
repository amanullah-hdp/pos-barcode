import { Router } from 'express';
import { getDb } from '../db.js';
import { apiErrorMessage } from '../utils/apiErrors.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM brands ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  try {
    const result = getDb().prepare('INSERT INTO brands (name) VALUES (?)').run(name);
    res.status(201).json({ id: Number(result.lastInsertRowid), name });
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not add brand.') });
  }
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM brands WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }
  try {
    db.prepare('UPDATE brands SET name = ? WHERE id = ?').run(name, id);
    res.json({ id, name });
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not update brand.') });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM brands WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }
  const used = db.prepare('SELECT COUNT(*) AS n FROM products WHERE brand_id = ?').get(id) as { n: number };
  if (used.n > 0) {
    res.status(400).json({ error: `Cannot delete: ${used.n} product(s) use this brand` });
    return;
  }
  db.prepare('DELETE FROM brands WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
