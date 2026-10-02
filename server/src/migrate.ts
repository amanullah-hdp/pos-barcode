import type Database from 'better-sqlite3';
import {
  CUBEX_RECEIPT_POWERED_BY,
  CUBEX_RECEIPT_TERMS_BODY,
  isLegacyBarcodeReceiptTerms,
  needsCubexTermsLineBreaks,
} from './defaults/cubexReceipt.js';
import { BARCODE_PWD_ISB_PROFILE, shouldApplyDefaultShopProfile } from './defaults/shopProfile.js';

const settingsColumns: { name: string; ddl: string }[] = [
  { name: 'receipt_brand', ddl: "ALTER TABLE settings ADD COLUMN receipt_brand TEXT NOT NULL DEFAULT 'BARCODE'" },
  { name: 'till_no', ddl: "ALTER TABLE settings ADD COLUMN till_no TEXT NOT NULL DEFAULT '1'" },
  { name: 'staff_id', ddl: "ALTER TABLE settings ADD COLUMN staff_id TEXT NOT NULL DEFAULT '1'" },
  { name: 'cashier_name', ddl: "ALTER TABLE settings ADD COLUMN cashier_name TEXT NOT NULL DEFAULT 'Cashier'" },
  { name: 'receipt_terms', ddl: "ALTER TABLE settings ADD COLUMN receipt_terms TEXT NOT NULL DEFAULT ''" },
  { name: 'feedback_whatsapp', ddl: "ALTER TABLE settings ADD COLUMN feedback_whatsapp TEXT NOT NULL DEFAULT ''" },
  {
    name: 'receipt_powered_by',
    ddl: "ALTER TABLE settings ADD COLUMN receipt_powered_by TEXT NOT NULL DEFAULT 'www.cubexretail.com'",
  },
];

const salesColumns: { name: string; ddl: string }[] = [
  { name: 'shop_discount_cents', ddl: 'ALTER TABLE sales ADD COLUMN shop_discount_cents INTEGER NOT NULL DEFAULT 0' },
  { name: 'staff_id', ddl: 'ALTER TABLE sales ADD COLUMN staff_id INTEGER REFERENCES staff(id)' },
  { name: 'staff_code', ddl: 'ALTER TABLE sales ADD COLUMN staff_code TEXT' },
  { name: 'staff_name', ddl: 'ALTER TABLE sales ADD COLUMN staff_name TEXT' },
];

const saleLineColumns: { name: string; ddl: string }[] = [
  { name: 'discount_cents', ddl: 'ALTER TABLE sale_lines ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0' },
];

function addMissingColumns(db: Database.Database, table: string, cols: { name: string; ddl: string }[]) {
  const existing = new Set(
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name),
  );
  for (const col of cols) {
    if (!existing.has(col.name)) db.exec(col.ddl);
  }
}

function applyDefaultShopProfileIfNeeded(db: Database.Database) {
  const row = db.prepare('SELECT shop_name, address FROM settings WHERE id = 1').get() as
    | { shop_name: string; address: string }
    | undefined;
  if (!row || !shouldApplyDefaultShopProfile(row.shop_name, row.address)) return;

  const p = BARCODE_PWD_ISB_PROFILE;
  db.prepare(
    `UPDATE settings SET
      shop_name = ?,
      address = ?,
      phone = ?,
      receipt_footer = ?,
      receipt_brand = ?,
      till_no = ?,
      staff_id = ?,
      cashier_name = ?,
      receipt_terms = ?,
      feedback_whatsapp = ?,
      receipt_powered_by = ?
     WHERE id = 1`,
  ).run(
    p.shop_name,
    p.address,
    p.phone,
    p.receipt_footer,
    p.receipt_brand,
    p.till_no,
    p.staff_id,
    p.cashier_name,
    p.receipt_terms,
    p.feedback_whatsapp,
    p.receipt_powered_by,
  );
}

/** Upgrade PWD-ISB shops still on pre-Cubex receipt copy/layout fields. */
function upgradeCubexReceiptIfNeeded(db: Database.Database) {
  const row = db.prepare(
    'SELECT shop_name, address, phone, receipt_terms, receipt_powered_by FROM settings WHERE id = 1',
  ).get() as
    | {
        shop_name: string;
        address: string;
        phone: string;
        receipt_terms: string;
        receipt_powered_by: string;
      }
    | undefined;
  if (!row || row.shop_name !== BARCODE_PWD_ISB_PROFILE.shop_name) return;

  const needsTerms =
    !row.receipt_terms?.trim() ||
    isLegacyBarcodeReceiptTerms(row.receipt_terms) ||
    needsCubexTermsLineBreaks(row.receipt_terms);
  const needsAddress = !row.address.includes('\n') && row.address.includes('PWD Road');
  const needsPhone = row.phone.includes('\n');
  const needsPowered = !row.receipt_powered_by?.trim();

  if (!needsTerms && !needsAddress && !needsPhone && !needsPowered) return;

  db.prepare(
    `UPDATE settings SET
      address = ?,
      phone = ?,
      receipt_terms = ?,
      receipt_powered_by = ?
     WHERE id = 1`,
  ).run(
    needsAddress ? BARCODE_PWD_ISB_PROFILE.address : row.address,
    needsPhone ? BARCODE_PWD_ISB_PROFILE.phone : row.phone,
    needsTerms ? CUBEX_RECEIPT_TERMS_BODY : row.receipt_terms,
    needsPowered ? CUBEX_RECEIPT_POWERED_BY : row.receipt_powered_by,
  );
}

function ensureStaffTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function runMigrations(db: Database.Database) {
  ensureStaffTable(db);
  addMissingColumns(db, 'settings', settingsColumns);
  addMissingColumns(db, 'sales', salesColumns);
  addMissingColumns(db, 'sale_lines', saleLineColumns);
  applyDefaultShopProfileIfNeeded(db);
  upgradeCubexReceiptIfNeeded(db);
}
