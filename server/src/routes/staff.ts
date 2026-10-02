import { Router } from 'express';
import { getDb } from '../db.js';
import { apiErrorMessage } from '../utils/apiErrors.js';

const router = Router();

function normalizeCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

function normalizeName(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

router.get('/', (_req, res) => {
  const rows = getDb()
    .prepare('SELECT id, staff_code, name, active, created_at FROM staff ORDER BY staff_code')
    .all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const staff_code = normalizeCode(req.body?.staff_code);
  const name = normalizeName(req.body?.name);
  if (!staff_code) {
    res.status(400).json({ error: 'Staff ID is required' });
    return;
  }
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  try {
    const result = getDb()
      .prepare('INSERT INTO staff (staff_code, name) VALUES (?, ?)')
      .run(staff_code, name);
    res.status(201).json({
      id: Number(result.lastInsertRowid),
      staff_code,
      name,
      active: 1,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not add staff.') });
  }
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const db = getDb();
  const existing = db
    .prepare('SELECT id, staff_code, name, active FROM staff WHERE id = ?')
    .get(id) as { id: number; staff_code: string; name: string; active: number } | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Staff not found' });
    return;
  }

  const staff_code =
    req.body?.staff_code !== undefined ? normalizeCode(req.body.staff_code) : existing.staff_code;
  const name = req.body?.name !== undefined ? normalizeName(req.body.name) : existing.name;
  let active = existing.active;
  if (req.body?.active !== undefined) {
    active = req.body.active ? 1 : 0;
  }

  if (!staff_code) {
    res.status(400).json({ error: 'Staff ID is required' });
    return;
  }
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  try {
    db.prepare('UPDATE staff SET staff_code = ?, name = ?, active = ? WHERE id = ?').run(
      staff_code,
      name,
      active,
      id,
    );
    res.json({ id, staff_code, name, active });
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Could not update staff.') });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM staff WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Staff not found' });
    return;
  }
  const used = db.prepare('SELECT COUNT(*) AS n FROM sales WHERE staff_id = ?').get(id) as { n: number };
  if (used.n > 0) {
    res.status(400).json({ error: `Cannot delete: ${used.n} sale(s) are linked to this staff member` });
    return;
  }
  db.prepare('DELETE FROM staff WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
