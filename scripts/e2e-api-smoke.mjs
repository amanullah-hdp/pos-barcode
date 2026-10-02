#!/usr/bin/env node
/** Quick API smoke — run while server is on :3001 */
const BASE = process.env.POS_API ?? 'http://127.0.0.1:3001';

const failures = [];

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) failures.push(`${path} → ${res.status} ${body.error ?? ''}`);
  return { res, body };
}

async function post(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) failures.push(`${path} POST → ${res.status} ${body.error ?? JSON.stringify(body)}`);
  return { res, body };
}

async function patch(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) failures.push(`${path} PATCH → ${res.status} ${body.error ?? ''}`);
  return { res, body };
}

const { body: health } = await get('/api/health');
if (!health.features?.discounts) failures.push('health: discounts feature missing');

const checks = [
  '/api/products',
  '/api/settings',
  '/api/customers',
  '/api/sales',
  '/api/day-close/status',
  '/api/products/alerts/low-stock',
  '/api/reports/daily?from=2026-01-01&to=2026-12-31',
  '/api/brands',
  '/api/categories',
];
for (const p of checks) await get(p);

const { body: products } = await get('/api/products');
const inStock = products.find((p) => p.stock_qty > 0);
if (!inStock) failures.push('no in-stock product for checkout test');

if (inStock) {
  const { body: sale, res } = await post('/api/sales/checkout', {
    payment_method: 'cash',
    shop_discount_cents: 10000,
    lines: [
      {
        product_id: inStock.id,
        label: inStock.name,
        qty: 1,
        unit_price_cents: inStock.price_cents,
        discount_cents: 0,
      },
    ],
  });
  if (res.ok) {
    const expected = inStock.price_cents - 10000;
    if (sale.sale.total_cents !== expected) {
      failures.push(`checkout total ${sale.sale.total_cents} expected ${expected}`);
    }
    if (sale.sale.shop_discount_cents !== 10000) {
      failures.push(`shop_discount_cents ${sale.sale.shop_discount_cents}`);
    }
    const saleId = sale.sale.id;
    const lineId = sale.lines[0]?.id;
    if (lineId) {
      const { body: patched } = await patch(`/api/sales/${saleId}/discounts`, {
        shop_discount_cents: 20000,
        lines: [{ id: lineId, discount_cents: 0 }],
      });
      if (patched.sale?.shop_discount_cents !== 20000) {
        failures.push('PATCH discounts shop amount wrong');
      }
    }
    await get(`/api/sales/${saleId}`);
  }
}

if (failures.length) {
  console.error('API E2E FAILURES:');
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('API E2E smoke: all checks passed');
