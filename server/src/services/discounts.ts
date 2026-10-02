/** Whole PKR only — cents must be a multiple of 100. */
export function assertWholeRupeeCents(cents: number, label: string) {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new Error(`${label} must be a non-negative whole number of rupees`);
  }
  if (cents % 100 !== 0) {
    throw new Error(`${label} must be whole rupees (no paisa)`);
  }
}

export type DiscountInputLine = {
  product_id: number | null;
  is_open_price: boolean;
  qty: number;
  unit_price_cents: number;
  discount_cents?: number;
};

export type SaleDiscountInput = {
  shop_discount_cents?: number;
  lines: DiscountInputLine[];
};

export type ComputedLine = DiscountInputLine & {
  gross_cents: number;
  discount_cents: number;
  line_total_cents: number;
};

export function computeSaleAmounts(input: SaleDiscountInput): {
  lines: ComputedLine[];
  subtotal_cents: number;
  line_discount_cents: number;
  shop_discount_cents: number;
  total_savings_cents: number;
  total_cents: number;
} {
  const shopRaw = input.shop_discount_cents ?? 0;
  assertWholeRupeeCents(shopRaw, 'Shop discount');

  const computed: ComputedLine[] = [];
  let subtotal = 0;
  let lineDiscountSum = 0;

  for (const line of input.lines) {
    const gross = line.qty * line.unit_price_cents;
    subtotal += gross;

    let disc = line.discount_cents ?? 0;
    if (line.is_open_price || !line.product_id) {
      if (disc > 0) throw new Error('Discounts apply to catalog items only');
      disc = 0;
    } else {
      assertWholeRupeeCents(disc, 'Line discount');
      if (disc > gross) throw new Error('Line discount cannot exceed line amount');
    }

    lineDiscountSum += disc;
    computed.push({
      ...line,
      gross_cents: gross,
      discount_cents: disc,
      line_total_cents: gross - disc,
    });
  }

  if (shopRaw > 0 && lineDiscountSum > 0) {
    throw new Error('Use either line discounts or shop discount, not both');
  }

  if (shopRaw > subtotal) {
    throw new Error('Shop discount cannot exceed subtotal');
  }

  const total_savings_cents = lineDiscountSum + shopRaw;
  const total_cents = subtotal - total_savings_cents;

  if (total_cents < 0) {
    throw new Error('Total cannot be negative');
  }

  return {
    lines: computed,
    subtotal_cents: subtotal,
    line_discount_cents: lineDiscountSum,
    shop_discount_cents: shopRaw,
    total_savings_cents,
    total_cents,
  };
}
