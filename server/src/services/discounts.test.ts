import assert from 'node:assert/strict';
import test from 'node:test';
import { computeSaleAmounts } from './discounts.js';

test('line discounts reduce total', () => {
  const r = computeSaleAmounts({
    lines: [
      {
        product_id: 1,
        is_open_price: false,
        qty: 1,
        unit_price_cents: 250000,
        discount_cents: 50000,
      },
    ],
  });
  assert.equal(r.subtotal_cents, 250000);
  assert.equal(r.line_discount_cents, 50000);
  assert.equal(r.total_cents, 200000);
});

test('shop discount excludes line discounts', () => {
  assert.throws(
    () =>
      computeSaleAmounts({
        shop_discount_cents: 10000,
        lines: [
          {
            product_id: 1,
            is_open_price: false,
            qty: 1,
            unit_price_cents: 100000,
            discount_cents: 10000,
          },
        ],
      }),
    /either line discounts or shop discount/,
  );
});

test('whole rupee enforcement', () => {
  assert.throws(
    () =>
      computeSaleAmounts({
        lines: [
          {
            product_id: 1,
            is_open_price: false,
            qty: 1,
            unit_price_cents: 100000,
            discount_cents: 150,
          },
        ],
      }),
    /whole rupees/,
  );
});
