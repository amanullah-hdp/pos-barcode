import { getDb, getSettingsRow, isDayClosedForToday, parsePaymentMethods, todayBusinessDate } from '../db.js';
import { computeSaleAmounts } from './discounts.js';
import { settingsForReceipt } from '../utils/settingsDto.js';
import { saleLinesForReceipt } from '../utils/saleLinesDto.js';
import { syncReceiptSequence } from '../utils/receiptSeq.js';

export type CheckoutLine = {
  product_id?: number | null;
  label: string;
  qty: number;
  unit_price_cents: number;
  is_open_price?: boolean;
  discount_cents?: number;
};

export type CheckoutPayload = {
  payment_method: 'cash' | 'card' | 'wallet' | 'bank_transfer';
  payment_reference?: string | null;
  customer_id?: number | null;
  shop_discount_cents?: number;
  staff_id?: number | null;
  lines: CheckoutLine[];
};

type ResolvedStaff = {
  staff_id: number | null;
  staff_code: string | null;
  staff_name: string | null;
};

export function resolveCheckoutStaff(
  db: ReturnType<typeof getDb>,
  staffId: number | null | undefined,
): ResolvedStaff {
  const activeCount = (
    db.prepare('SELECT COUNT(*) AS n FROM staff WHERE active = 1').get() as { n: number }
  ).n;
  if (activeCount === 0) {
    throw new Error('Add at least one staff member under Inventory → Staff before making sales.');
  }
  const id = staffId == null ? null : Number(staffId);
  if (id == null || !Number.isInteger(id) || id <= 0) {
    throw new Error('Select a staff member before completing the sale.');
  }
  const row = db
    .prepare('SELECT id, staff_code, name FROM staff WHERE id = ? AND active = 1')
    .get(id) as { id: number; staff_code: string; name: string } | undefined;
  if (!row) {
    throw new Error('Staff member not found or inactive.');
  }
  return { staff_id: row.id, staff_code: row.staff_code, staff_name: row.name };
}

function openPriceMaxCents(): number {
  const raw = process.env.BARCODE_POS_OPEN_PRICE_MAX_CENTS;
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isInteger(n) && n > 0) return n;
  }
  return 50_000_000;
}

type ResolvedLine = {
  product_id: number | null;
  label: string;
  qty: number;
  unit_price_cents: number;
  is_open_price: boolean;
  discount_cents: number;
};

export function resolveCheckoutLines(payload: CheckoutPayload, db: ReturnType<typeof getDb>): ResolvedLine[] {
  if (!payload.lines?.length) {
    throw new Error('Cart is empty');
  }

  const stockByProduct = new Map<number, number>();
  const resolved: ResolvedLine[] = [];

  for (const line of payload.lines) {
    if (!line.label?.trim()) throw new Error('Line label required');
    if (!Number.isInteger(line.qty) || line.qty <= 0) throw new Error('Invalid quantity');

    if (line.product_id) {
      const product = db
        .prepare('SELECT id, name, price_cents, stock_qty FROM products WHERE id = ?')
        .get(line.product_id) as { id: number; name: string; price_cents: number; stock_qty: number } | undefined;
      if (!product) throw new Error(`Product not found (id ${line.product_id})`);

      stockByProduct.set(product.id, (stockByProduct.get(product.id) ?? 0) + line.qty);
      resolved.push({
        product_id: product.id,
        label: product.name,
        qty: line.qty,
        unit_price_cents: product.price_cents,
        is_open_price: false,
        discount_cents: line.discount_cents ?? 0,
      });
      continue;
    }

    if (!line.is_open_price) {
      throw new Error('Each line must be a catalog product or an open-price item');
    }

    if (!Number.isInteger(line.unit_price_cents) || line.unit_price_cents < 0) {
      throw new Error('Invalid open price');
    }
    if (line.unit_price_cents > openPriceMaxCents()) {
      throw new Error('Open price exceeds allowed maximum');
    }

    resolved.push({
      product_id: null,
      label: line.label.trim(),
      qty: line.qty,
      unit_price_cents: line.unit_price_cents,
      is_open_price: true,
      discount_cents: 0,
    });
  }

  for (const [productId, needed] of stockByProduct) {
    const row = db.prepare('SELECT stock_qty, name FROM products WHERE id = ?').get(productId) as
      | { stock_qty: number; name: string }
      | undefined;
    if (!row) continue;
    if (row.stock_qty < needed) {
      throw new Error(`Insufficient stock for ${row.name} (need ${needed}, have ${row.stock_qty})`);
    }
  }

  return resolved;
}

export function checkout(payload: CheckoutPayload) {
  if (isDayClosedForToday()) {
    throw new Error('Day is closed. Reopen the day or wait until tomorrow to make sales.');
  }

  const settingsRow = getSettingsRow();
  const methods = parsePaymentMethods(settingsRow.payment_methods_json);
  if (!methods[payload.payment_method]) {
    throw new Error('Payment method is disabled in settings');
  }

  const db = getDb();
  const staff = resolveCheckoutStaff(db, payload.staff_id);
  const resolved = resolveCheckoutLines(payload, db);
  const amounts = computeSaleAmounts({
    shop_discount_cents: payload.shop_discount_cents ?? 0,
    lines: resolved.map((l) => ({
      product_id: l.product_id,
      is_open_price: l.is_open_price,
      qty: l.qty,
      unit_price_cents: l.unit_price_cents,
      discount_cents: l.discount_cents,
    })),
  });

  const tx = db.transaction(() => {
    const receiptNumber = syncReceiptSequence(db);
    const nextReceipt = receiptNumber + 1;

    const saleResult = db
      .prepare(
        `INSERT INTO sales (receipt_number, customer_id, payment_method, payment_reference, total_cents, shop_discount_cents, staff_id, staff_code, staff_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        receiptNumber,
        payload.customer_id ?? null,
        payload.payment_method,
        payload.payment_reference ?? null,
        amounts.total_cents,
        amounts.shop_discount_cents,
        staff.staff_id,
        staff.staff_code,
        staff.staff_name,
      );

    const saleId = Number(saleResult.lastInsertRowid);

    const insertLine = db.prepare(
      `INSERT INTO sale_lines (sale_id, product_id, label, qty, unit_price_cents, line_total_cents, discount_cents, is_open_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const updateStock = db.prepare(
      `UPDATE products SET stock_qty = stock_qty - ?, updated_at = datetime('now') WHERE id = ?`,
    );

    for (let i = 0; i < resolved.length; i++) {
      const line = resolved[i]!;
      const computed = amounts.lines[i]!;
      insertLine.run(
        saleId,
        line.product_id,
        line.label,
        line.qty,
        line.unit_price_cents,
        computed.line_total_cents,
        computed.discount_cents,
        line.is_open_price ? 1 : 0,
      );
      if (line.product_id) {
        updateStock.run(line.qty, line.product_id);
      }
    }

    db.prepare("UPDATE meta SET value = ? WHERE key = 'receipt_seq'").run(String(nextReceipt));

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
    const lines = saleLinesForReceipt(db, saleId);
    let customer_name: string | null = null;
    if (payload.customer_id) {
      const c = db.prepare('SELECT name FROM customers WHERE id = ?').get(payload.customer_id) as
        | { name: string }
        | undefined;
      customer_name = c?.name ?? null;
    }

    return {
      sale,
      lines,
      settings: settingsForReceipt(),
      business_date: todayBusinessDate(),
      customer_name,
    };
  });

  return tx();
}

export function reopenDay() {
  const db = getDb();
  db.prepare('UPDATE settings SET day_closed_date = NULL WHERE id = 1').run();
}
