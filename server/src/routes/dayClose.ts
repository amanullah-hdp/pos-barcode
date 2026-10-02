import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, getSettingsRow, todayBusinessDate } from '../db.js';

const router = Router();

router.get('/status', (_req, res) => {
  const settings = getSettingsRow();
  const businessDate = todayBusinessDate();
  const closed = settings.day_closed_date === businessDate;

  const expected = getDb()
    .prepare(
      `SELECT COALESCE(SUM(total_cents), 0) AS expected_cash_cents
       FROM sales
       WHERE payment_method = 'cash' AND date(created_at) = date(?)`,
    )
    .get(businessDate) as { expected_cash_cents: number };

  const closeRow = getDb()
    .prepare('SELECT * FROM day_closes WHERE business_date = ?')
    .get(businessDate);

  res.json({
    business_date: businessDate,
    closed,
    expected_cash_cents: expected.expected_cash_cents,
    close: closeRow ?? null,
  });
});

router.post('/close', (req, res) => {
  const businessDate = todayBusinessDate();
  const settings = getSettingsRow();
  if (settings.day_closed_date === businessDate) {
    res.status(400).json({ error: 'Day already closed' });
    return;
  }

  const counted = Number(req.body?.counted_cash_cents);
  if (!Number.isInteger(counted) || counted < 0) {
    res.status(400).json({ error: 'counted_cash_cents required (integer >= 0)' });
    return;
  }

  const notes = typeof req.body?.notes === 'string' ? req.body.notes : null;
  const db = getDb();
  const expectedRow = db
    .prepare(
      `SELECT COALESCE(SUM(total_cents), 0) AS expected_cash_cents
       FROM sales WHERE payment_method = 'cash' AND date(created_at) = date(?)`,
    )
    .get(businessDate) as { expected_cash_cents: number };

  const expected = expectedRow.expected_cash_cents;
  const variance = counted - expected;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO day_closes (business_date, expected_cash_cents, counted_cash_cents, variance_cents, notes)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(businessDate, expected, counted, variance, notes);

    db.prepare('UPDATE settings SET day_closed_date = ? WHERE id = 1').run(businessDate);
  });

  tx();

  const dbPath = settings.db_path;
  if (dbPath && fs.existsSync(dbPath)) {
    const backupDir = path.join(path.dirname(dbPath), 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `pos-${businessDate}.sqlite`);
    fs.copyFileSync(dbPath, backupPath);
  }

  res.json({
    business_date: businessDate,
    expected_cash_cents: expected,
    counted_cash_cents: counted,
    variance_cents: variance,
    notes,
  });
});

export default router;
