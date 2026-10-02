import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { barcodeDataDir } from './utils/dataDir.js';
import { runMigrations } from './migrate.js';
import { syncReceiptSequence } from './utils/receiptSeq.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

/** Test-only: close and reset the singleton database handle. */
export function resetDbForTests() {
  if (db) {
    db.close();
    db = null;
  }
}

function defaultDbPath(): string {
  return path.join(barcodeDataDir(), 'pos.sqlite');
}

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.BARCODE_POS_DB ?? defaultDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  runMigrations(db);

  const settings = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (!settings) {
    db.prepare(
      `INSERT INTO settings (id, shop_name, payment_methods_json, db_path)
       VALUES (1, 'Barcode', ?, ?)`,
    ).run(
      JSON.stringify({
        cash: true,
        card: true,
        wallet: true,
        bank_transfer: true,
      }),
      dbPath,
    );
  }

  const receiptMeta = db.prepare("SELECT value FROM meta WHERE key = 'receipt_seq'").get() as
    | { value: string }
    | undefined;
  if (!receiptMeta) {
    db.prepare("INSERT INTO meta (key, value) VALUES ('receipt_seq', '1000')").run();
  }

  syncReceiptSequence(db);

  const resolvedPath = path.resolve(dbPath);
  db.prepare('UPDATE settings SET db_path = ? WHERE id = 1').run(resolvedPath);

  return db;
}

export function businessDateFromIso(iso: string): string {
  return iso.slice(0, 10);
}

export function todayBusinessDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export type PaymentMethods = {
  cash: boolean;
  card: boolean;
  wallet: boolean;
  bank_transfer: boolean;
};

export function getSettingsRow() {
  return getDb().prepare('SELECT * FROM settings WHERE id = 1').get() as {
    id: number;
    shop_name: string;
    address: string;
    phone: string;
    logo_path: string | null;
    receipt_footer: string;
    payment_methods_json: string;
    db_path: string | null;
    day_closed_date: string | null;
    receipt_brand: string;
    till_no: string;
    staff_id: string;
    cashier_name: string;
    receipt_terms: string;
    feedback_whatsapp: string;
    receipt_powered_by: string;
  };
}

export function parsePaymentMethods(json: string): PaymentMethods {
  return JSON.parse(json) as PaymentMethods;
}

export function isDayClosedForToday(): boolean {
  const settings = getSettingsRow();
  if (!settings.day_closed_date) return false;
  return settings.day_closed_date === todayBusinessDate();
}
