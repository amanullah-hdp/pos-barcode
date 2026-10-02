import { Router } from 'express';
import { apiErrorMessage } from '../utils/apiErrors.js';
import { parse } from 'csv-parse/sync';
import multer from 'multer';
import { getDb } from '../db.js';
import { parseMoneyToCents } from '../utils/money.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

function findOrCreateBrand(db: ReturnType<typeof getDb>, name: string): number {
  const trimmed = name.trim();
  const existing = db.prepare('SELECT id FROM brands WHERE name = ?').get(trimmed) as
    | { id: number }
    | undefined;
  if (existing) return existing.id;
  const r = db.prepare('INSERT INTO brands (name) VALUES (?)').run(trimmed);
  return Number(r.lastInsertRowid);
}

function findOrCreateCategory(db: ReturnType<typeof getDb>, name: string): number {
  const trimmed = name.trim();
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(trimmed) as
    | { id: number }
    | undefined;
  if (existing) return existing.id;
  const r = db.prepare('INSERT INTO categories (name) VALUES (?)').run(trimmed);
  return Number(r.lastInsertRowid);
}

router.post('/csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'CSV file required (field: file)' });
    return;
  }

  let records: Record<string, string>[];
  try {
    records = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch (e) {
    res.status(400).json({ error: apiErrorMessage(e, 'Invalid CSV file.') });
    return;
  }

  const errors: { line: number; message: string }[] = [];
  const validRows: {
    sku: string;
    barcode: string | null;
    name: string;
    brand: string;
    category: string;
    cost_cents: number;
    price_cents: number;
    stock_qty: number;
    low_stock_threshold: number;
  }[] = [];

  records.forEach((row, index) => {
    const line = index + 2;
    try {
      const sku = row.sku?.trim();
      const name = row.name?.trim();
      if (!sku || !name) {
        errors.push({ line, message: 'sku and name are required' });
        return;
      }
      validRows.push({
        sku,
        barcode: row.barcode?.trim() || null,
        name,
        brand: row.brand?.trim() || 'Unknown',
        category: row.category?.trim() || 'Uncategorized',
        cost_cents: parseMoneyToCents(row.cost ?? '0'),
        price_cents: parseMoneyToCents(row.price ?? '0'),
        stock_qty: Number.parseInt(row.stock_qty ?? '0', 10) || 0,
        low_stock_threshold: Number.parseInt(row.low_stock_threshold ?? '0', 10) || 0,
      });
    } catch (e) {
      errors.push({ line, message: apiErrorMessage(e, 'Invalid row.') });
    }
  });

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', errors, imported: 0 });
    return;
  }

  const db = getDb();
  const upsert = db.transaction(() => {
    const stmt = db.prepare(
      `INSERT INTO products (sku, barcode, name, brand_id, category_id, cost_cents, price_cents, stock_qty, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(sku) DO UPDATE SET
         barcode = excluded.barcode,
         name = excluded.name,
         brand_id = excluded.brand_id,
         category_id = excluded.category_id,
         cost_cents = excluded.cost_cents,
         price_cents = excluded.price_cents,
         stock_qty = excluded.stock_qty,
         low_stock_threshold = excluded.low_stock_threshold,
         updated_at = datetime('now')`,
    );

    for (const row of validRows) {
      const brandId = findOrCreateBrand(db, row.brand);
      const categoryId = findOrCreateCategory(db, row.category);
      stmt.run(
        row.sku,
        row.barcode,
        row.name,
        brandId,
        categoryId,
        row.cost_cents,
        row.price_cents,
        row.stock_qty,
        row.low_stock_threshold,
      );
    }
  });

  try {
    upsert();
    res.json({ imported: validRows.length, errors: [] });
  } catch (e) {
    res.status(500).json({ error: apiErrorMessage(e, 'Import failed. Please check the file and try again.') });
  }
});

export default router;
