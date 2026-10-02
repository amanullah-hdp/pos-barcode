import type Database from 'better-sqlite3';

export type ReceiptLine = {
  id: number;
  label: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  discount_cents: number;
  is_open_price: number;
  sku: string | null;
};

export function saleLinesForReceipt(db: Database.Database, saleId: number): ReceiptLine[] {
  return db
    .prepare(
      `SELECT sl.id, sl.label, sl.qty, sl.unit_price_cents, sl.line_total_cents, sl.discount_cents, sl.is_open_price, p.sku
       FROM sale_lines sl
       LEFT JOIN products p ON p.id = sl.product_id
       WHERE sl.sale_id = ?
       ORDER BY sl.id`,
    )
    .all(saleId) as ReceiptLine[];
}
