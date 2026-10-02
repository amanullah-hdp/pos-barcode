import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { getDb, resetDbForTests } from '../db.js';
import { checkout, resolveCheckoutLines } from './checkout.js';

function tempDb(): string {
  return path.join(os.tmpdir(), `pos-test-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);
}

function seedStaff(db: ReturnType<typeof getDb>): number {
  const result = db.prepare('INSERT INTO staff (staff_code, name) VALUES (?, ?)').run('1', 'Test Staff');
  return Number(result.lastInsertRowid);
}

function seedProduct(db: ReturnType<typeof getDb>, id: number, stock: number, price: number) {
  db.prepare('INSERT INTO brands (name) VALUES (?) ON CONFLICT DO NOTHING').run('TestBrand');
  db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT DO NOTHING').run('TestCat');
  const brandId = (db.prepare('SELECT id FROM brands WHERE name = ?').get('TestBrand') as { id: number }).id;
  const catId = (db.prepare('SELECT id FROM categories WHERE name = ?').get('TestCat') as { id: number }).id;
  db.prepare(
    `INSERT INTO products (id, sku, barcode, name, brand_id, category_id, cost_cents, price_cents, stock_qty, low_stock_threshold)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`,
  ).run(id, `SKU-${id}`, `BC${id}`, `Product ${id}`, brandId, catId, price, stock);
}

test('resolveCheckoutLines uses catalog price and blocks oversell', () => {
  const dbPath = tempDb();
  process.env.BARCODE_POS_DB = dbPath;
  resetDbForTests();
  const db = getDb();
  seedProduct(db, 1, 2, 50000);

  const lines = resolveCheckoutLines(
    {
      payment_method: 'cash',
      lines: [{ product_id: 1, label: 'ignored', qty: 2, unit_price_cents: 1 }],
    },
    db,
  );
  assert.equal(lines[0].unit_price_cents, 50000);

  assert.throws(
    () =>
      resolveCheckoutLines(
        {
          payment_method: 'cash',
          lines: [{ product_id: 1, label: 'x', qty: 3, unit_price_cents: 50000 }],
        },
        db,
      ),
    /Insufficient stock/,
  );

  resetDbForTests();
  fs.unlinkSync(dbPath);
});

test('open price line requires flag', () => {
  const dbPath = tempDb();
  process.env.BARCODE_POS_DB = dbPath;
  resetDbForTests();
  const db = getDb();

  assert.throws(
    () =>
      resolveCheckoutLines(
        {
          payment_method: 'cash',
          lines: [{ label: 'Custom', qty: 1, unit_price_cents: 1000 }],
        },
        db,
      ),
    /open-price/,
  );

  const lines = resolveCheckoutLines(
    {
      payment_method: 'cash',
      lines: [{ label: 'Custom', qty: 1, unit_price_cents: 1000, is_open_price: true }],
    },
    db,
  );
  assert.equal(lines[0].is_open_price, true);

  resetDbForTests();
  fs.unlinkSync(dbPath);
});

test('checkout decrements stock', () => {
  const dbPath = tempDb();
  process.env.BARCODE_POS_DB = dbPath;
  resetDbForTests();
  const db = getDb();
  seedProduct(db, 5, 5, 25000);
  const staffId = seedStaff(db);

  checkout({
    payment_method: 'cash',
    staff_id: staffId,
    lines: [{ product_id: 5, label: 'Product 5', qty: 2, unit_price_cents: 25000 }],
  });

  const row = db.prepare('SELECT stock_qty FROM products WHERE id = 5').get() as { stock_qty: number };
  assert.equal(row.stock_qty, 3);

  resetDbForTests();
  fs.unlinkSync(dbPath);
});

test('checkout applies line discount on catalog items', () => {
  const dbPath = tempDb();
  process.env.BARCODE_POS_DB = dbPath;
  resetDbForTests();
  const db = getDb();
  seedProduct(db, 7, 10, 100000);
  const staffId = seedStaff(db);

  const result = checkout({
    payment_method: 'cash',
    staff_id: staffId,
    lines: [{ product_id: 7, label: 'Product 7', qty: 2, unit_price_cents: 100000, discount_cents: 50000 }],
  });

  assert.equal((result.sale as { total_cents: number }).total_cents, 150000);
  assert.equal(result.lines[0].discount_cents, 50000);

  resetDbForTests();
  fs.unlinkSync(dbPath);
});

test('checkout applies shop discount', () => {
  const dbPath = tempDb();
  process.env.BARCODE_POS_DB = dbPath;
  resetDbForTests();
  const db = getDb();
  seedProduct(db, 8, 10, 100000);
  const staffId = seedStaff(db);

  const result = checkout({
    payment_method: 'cash',
    staff_id: staffId,
    shop_discount_cents: 100000,
    lines: [{ product_id: 8, label: 'Product 8', qty: 1, unit_price_cents: 100000 }],
  });

  assert.equal((result.sale as { shop_discount_cents: number }).shop_discount_cents, 100000);
  assert.equal((result.sale as { total_cents: number }).total_cents, 0);

  resetDbForTests();
  fs.unlinkSync(dbPath);
});
