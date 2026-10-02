# Barcode POS — Interactive browser E2E test guide

Use this checklist **in Chrome or Edge** while the app is running. Tick each box as you go.  
**Tester:** _______________ **Date:** _______________ **Build:** `npm run dev` or production

---

## 0. Before you start

| Step | Action | Pass? |
|------|--------|-------|
| 0.1 | From project root: `npm install` (once) | ☐ |
| 0.2 | Start app: `npm run dev` | ☐ |
| 0.3 | Open **http://127.0.0.1:5173** | ☐ |
| 0.4 | Confirm sidebar shows **BARCODE PWD-ISB** (or your shop name) | ☐ |
| 0.5 | Open DevTools → Network → visit Register; confirm **no red** `/api/*` calls | ☐ |
| 0.6 | Optional: open http://127.0.0.1:3001/api/health — JSON must include `"features":{"discounts":true}` | ☐ |
| 0.7 | Automated API smoke: `npm run test:e2e:api` (server must be running) | ☐ |

**Fail 0.6?** Stop old API on port 3001, then `npm run build && npm run dev`.

**Do not** use `npm run seed` on a database that already has real sales.

---

## 1. Register — catalog & cart

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 1.1 | Stay on **Point of sales** (`/`) | Product grid loads (e.g. 75 items), **Open order** badge | ☐ |
| 1.2 | Click category **Perfumes** | Grid filters to perfumes only | ☐ |
| 1.3 | Type `attar` in **Scan barcode or search…** | List narrows to Attar Roll-On | ☐ |
| 1.4 | Click product **Attar Roll-On 12ml** → **Add to cart** | Modal shows stock line; cart shows 1 × Rs 1,200 | ☐ |
| 1.5 | Click **+** on quick-add for another in-stock item | Second line in cart; subtotal updates | ☐ |
| 1.6 | Find **OUT OF STOCK** tile (e.g. Analog Watch if stock ≤ 0) | Badge visible; add buttons disabled | ☐ |
| 1.7 | Try to add out-of-stock item | Nothing added; optional error message | ☐ |
| 1.8 | In cart, **Disc (PKR)** on a catalog line → enter `100` | TOTAL drops by Rs 100 (Per line mode) | ☐ |
| 1.9 | Switch discount to **Shop** → enter `50` in **Shop discount (PKR)** | Green **Discount −Rs 50**; TOTAL = subtotal − 50 | ☐ |
| 1.10 | **Custom item (open price)** → Description `Alteration`, Price `500` → Add | Line appears; no per-line discount field on it | ☐ |
| 1.11 | Select customer **Walk-in** vs a named customer | Customer name updates in cart header | ☐ |
| 1.12 | Select payment **Card** (or Wallet) | Tiles highlight; cash stays default if re-selected | ☐ |

---

## 2. Register — barcode scan (keyboard simulation)

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 2.1 | Click **Scan barcode or search…** | Field focused (blue outline) | ☐ |
| 2.2 | Type barcode `8901001001051` then **Enter** | Attar Roll-On adds (or qty increases if already in cart) | ☐ |
| 2.3 | Type nonsense `000000` + Enter | Error: no product for barcode | ☐ |
| 2.4 | Click **Disc (PKR)** or shop discount field and type | Focus **stays** in that field (not forced back to search) | ☐ |

---

## 3. Checkout & receipt

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 3.1 | Cart with **Shop** discount Rs 50 → **Place order** | No red error; print dialog opens (cancel OK for test) | ☐ |
| 3.2 | In print preview / receipt | PWD-ISB address, line items, **Shop Discount**, **Amount Due** = cart TOTAL | ☐ |
| 3.3 | Cart clears; **Track order** shows new receipt | Recent sale chip at bottom of register | ☐ |
| 3.4 | Repeat with **Per line** discount only | Receipt line **DISC** column shows amounts | ☐ |
| 3.5 | If you see **Total mismatch** | Fix API (section 0.6); do **not** sign off until resolved | ☐ |

---

## 4. Activity

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 4.1 | Sidebar → **Activity** | Queue tab lists today’s sales | ☐ |
| 4.2 | **Reprint** on latest sale | Print preview with same totals | ☐ |
| 4.3 | **Discounts** on a sale → **Shop** `100` → **Save & reprint** | New total on receipt; Activity row total updates | ☐ |
| 4.4 | **History** tab → change date range | Older sales load (if any) | ☐ |

---

## 5. Reports

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 5.1 | **Report** | KPIs and chart render for default range | ☐ |
| 5.2 | Change **From / To** dates | Numbers refresh; no API errors | ☐ |
| 5.3 | Top products / ledger sections | Data or empty state (not broken layout) | ☐ |

---

## 6. Inventory

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 6.1 | **Products** | Table lists SKUs, prices, stock | ☐ |
| 6.2 | Edit a product stock (e.g. set Analog Watch to `5`) → save | Row updates | ☐ |
| 6.3 | Register → that product | **OUT OF STOCK** gone if stock > 0 | ☐ |
| 6.4 | **Catalog** | Brands/categories manageable | ☐ |
| 6.5 | **Import** | Upload sample CSV (if client uses import) | ☐ |

---

## 7. Customers

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 7.1 | **Customers** | List loads | ☐ |
| 7.2 | Add/edit customer | Saves; appears in Register customer dropdown | ☐ |

---

## 8. End of day & exports

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 8.1 | **End of day** → close with counted cash | Success message | ☐ |
| 8.2 | **Register** | **Day closed**; Place order disabled | ☐ |
| 8.3 | Reopen day (EOD page or API flow you use) | Register **Open order** again | ☐ |
| 8.4 | **Exports** | Download/export runs without error | ☐ |
| 8.5 | Check `data/backups/` (or next to DB) | Backup file after close (when configured) | ☐ |

---

## 9. Settings

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 9.1 | **Settings** → change shop phone → **Save** | Success; receipt reprint shows new phone | ☐ |
| 9.2 | Toggle payment method off → Save | Method hidden on Register | ☐ |
| 9.3 | Receipt fields: till, staff ID, cashier, terms, WhatsApp | Appear on printed receipt where applicable | ☐ |
| 9.4 | If `BARCODE_POS_PIN` set: reload app | PIN gate before register | ☐ |

---

## 10. Sidebar & navigation

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| 10.1 | **Search menu** → type `report` | Nav filters to Report | ☐ |
| 10.2 | Visit every sidebar link once | No blank screen or 404 | ☐ |
| 10.3 | Mobile width (DevTools device toolbar) | Register cart opens from bottom bar | ☐ |

---

## 11. Automated checks (developer / release)

Run before client handoff:

```bash
npm run build
npm test
```

| Check | Pass? |
|-------|-------|
| Build exits 0 | ☐ |
| 8 server tests pass (checkout, discounts, stock) | ☐ |
| CI green on `main` (if using GitHub) | ☐ |

---

## Sign-off

| Area | Status (OK / Issues) | Notes |
|------|----------------------|-------|
| Register & scan | | |
| Discounts & receipt | | |
| Stock rules | | |
| Activity / reports | | |
| Inventory & settings | | |
| EOD & backups | | |
| Production env (PIN, DB path) | | |

**Approved for go-live:** ☐ Yes ☐ No — follow-up: ___________________________

---

## Quick reference

- **Dev URL:** http://127.0.0.1:5173  
- **API health:** http://127.0.0.1:3001/api/health  
- **Sample barcode (demo):** `8901001001051` → Attar Roll-On 12ml  
- **Discounts:** DISCOUNT → **Shop** or **Per line** (not custom item named “Discount”)
