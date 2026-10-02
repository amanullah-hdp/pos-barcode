import { getDb } from '../db.js';
import { settingsForClient } from '../utils/settingsDto.js';
import { saleLinesForReceipt } from '../utils/saleLinesDto.js';
import { assertWholeRupeeCents, computeSaleAmounts } from './discounts.js';

export type UpdateDiscountsPayload = {
  shop_discount_cents?: number;
  lines: { id: number; discount_cents: number }[];
};

export function updateSaleDiscounts(saleId: number, payload: UpdateDiscountsPayload) {
  const db = getDb();
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId) as
    | {
        id: number;
        customer_id: number | null;
      }
    | undefined;
  if (!sale) throw new Error('Sale not found');

  const dbLines = db
    .prepare('SELECT * FROM sale_lines WHERE sale_id = ? ORDER BY id')
    .all(saleId) as {
    id: number;
    product_id: number | null;
    qty: number;
    unit_price_cents: number;
    is_open_price: number;
  }[];

  const discountById = new Map(payload.lines.map((l) => [l.id, l.discount_cents]));

  const inputLines = dbLines.map((l) => ({
    product_id: l.product_id,
    is_open_price: l.is_open_price === 1,
    qty: l.qty,
    unit_price_cents: l.unit_price_cents,
    discount_cents: discountById.get(l.id) ?? 0,
  }));

  for (const upd of payload.lines) {
    assertWholeRupeeCents(upd.discount_cents, 'Line discount');
    if (!dbLines.some((l) => l.id === upd.id)) {
      throw new Error(`Unknown sale line id ${upd.id}`);
    }
  }

  const amounts = computeSaleAmounts({
    shop_discount_cents: payload.shop_discount_cents ?? 0,
    lines: inputLines,
  });

  const tx = db.transaction(() => {
    const updateLine = db.prepare(
      `UPDATE sale_lines SET discount_cents = ?, line_total_cents = ? WHERE id = ? AND sale_id = ?`,
    );
    for (let i = 0; i < dbLines.length; i++) {
      const row = amounts.lines[i]!;
      updateLine.run(row.discount_cents, row.line_total_cents, dbLines[i]!.id, saleId);
    }

    db.prepare(`UPDATE sales SET total_cents = ?, shop_discount_cents = ? WHERE id = ?`).run(
      amounts.total_cents,
      amounts.shop_discount_cents,
      saleId,
    );

    const updatedSale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
    const lines = saleLinesForReceipt(db, saleId);
    let customer_name: string | null = null;
    if (sale.customer_id) {
      const c = db.prepare('SELECT name FROM customers WHERE id = ?').get(sale.customer_id) as
        | { name: string }
        | undefined;
      customer_name = c?.name ?? null;
    }

    return {
      sale: updatedSale,
      lines,
      settings: settingsForClient(),
      customer_name,
      amounts,
    };
  });

  return tx();
}
