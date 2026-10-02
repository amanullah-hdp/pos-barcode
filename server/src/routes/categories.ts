import { Router } from 'express';
import { getDb } from '../db.js';
import { apiErrorMessage } from '../utils/apiErrors.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const parent_id =
    req.body?.parent_id !== undefined && req.body.parent_id !== null
      ? Number(req.body.parent_id)
      : null;
  try {
    const result = getDb()
      .prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)')
      .run(name, parent_id);
    res.status(201).json({ id: Number(result.lastInsertRowid), name, parent_id });
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not add category.') });
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
  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  try {
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    res.json({ id, name });
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not update category.') });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  const products = db.prepare('SELECT COUNT(*) AS n FROM products WHERE category_id = ?').get(id) as { n: number };
  if (products.n > 0) {
    res.status(400).json({ error: `Cannot delete: ${products.n} product(s) use this category` });
    return;
  }
  const children = db.prepare('SELECT COUNT(*) AS n FROM categories WHERE parent_id = ?').get(id) as { n: number };
  if (children.n > 0) {
    res.status(400).json({ error: 'Cannot delete: subcategories exist under this category' });
    return;
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
