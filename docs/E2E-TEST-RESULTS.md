# E2E test results (automated + browser)

**Date:** 2026-10-01  
**Environment:** `npm run dev` — client `:5173`, API `:3001`, DB `data/pos.sqlite`  
**Tester:** Cursor automated run

---

## Summary

| Layer | Result |
|--------|--------|
| `npm run build` | **PASS** |
| `npm test` (8 unit tests) | **PASS** |
| `npm run test:e2e:api` | **PASS** |
| Browser — all routes HTTP 200 | **PASS** |
| Browser — checkout + shop discount | **PASS** |
| Browser — Activity Reprint/Discounts | **PASS** (5 rows each) |
| Browser — stock UI | **PASS** (OUT OF STOCK on depleted SKUs; add disabled) |

**Overall:** Core POS flows are **operational** for client UAT. Items below need **manual** confirmation on the counter PC (printer, PIN, real CSV, EOD with backup).

---

## API smoke (`npm run test:e2e:api`)

- `/api/health` — `features.discounts: true`
- GET: products, settings, customers, sales, day-close status, low-stock alerts, reports/daily, brands, categories
- POST checkout with **shop_discount_cents 10000** — total and discount persisted correctly
- PATCH `/api/sales/:id/discounts` — shop discount update applied
- GET sale by id — receipt payload OK

---

## Browser (1400×900, Chrome automation)

### Register `/`

- Catalog loads (75 items), categories, sidebar **BARCODE PWD-ISB**
- **OUT OF STOCK** on zero-stock items; quick-add **disabled**
- Add **Premium Socks 3pk** → cart
- **Shop** discount **50 PKR** → **Place order** → **no Total mismatch / stock error** (`window.print` stubbed for automation)
- Open order badge present

### Routes (SPA)

All return **200** and render without “Failed to load”:

`/`, `/activity`, `/reports`, `/products`, `/catalog`, `/import`, `/customers`, `/close`, `/exports`, `/settings`

### Activity `/activity`

- Queue lists today’s sales
- **Reprint** and **Discounts** buttons present on rows (5+)

### Products `/products`

- Inventory heading, search, **+ Add product**

### Reports `/reports`

- Page loads (Report content, no error state)

---

## Unit tests (server)

- Checkout catalog price, stock, open-price rules
- Line + shop discounts, mutual exclusion, whole rupees
- Shop discount on checkout

---

## Not fully automated (manual on site)

| Item | Why manual |
|------|------------|
| Thermal receipt print preview | OS print dialog |
| `BARCODE_POS_PIN` lock screen | Requires production env |
| CSV **Import** upload | File picker + sample file |
| **End of day** close + reopen | Changes live DB / backups |
| **Exports** download | Browser download path |
| Bluetooth/USB scanner hardware | Physical device |
| Production `npm start` on `:3001` only | Separate deploy check |

Use [E2E-INTERACTIVE-TEST-GUIDE.md](./E2E-INTERACTIVE-TEST-GUIDE.md) for step-by-step manual sign-off.

---

## How to re-run

```bash
npm run dev          # terminal 1
npm run build
npm test
npm run test:e2e:api
```

Then walk through the interactive guide in the browser.
