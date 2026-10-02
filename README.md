# Barcode POS v3

Bakehouse-style **light POS** (blue primary, Inter, card UI). Offline SQLite, PKR, English receipts.

## Run (development)

```bash
npm install
npm run seed      # demo catalog → data/pos.sqlite (skips if sales exist unless confirmed)
npm run dev       # http://127.0.0.1:5173 + API :3001
```

Database path: `BARCODE_POS_DB` defaults to `./data/pos.sqlite` when using npm scripts (`$INIT_CWD/data/pos.sqlite`).

## Windows desktop installer (no source for client)

Electron + NSIS **Setup.exe** — see [docs/DESKTOP-PHASE1.md](docs/DESKTOP-PHASE1.md). You can develop on **macOS**; build the `.exe` on Windows or via GitHub Actions.

## Production (single counter PC)

1. Copy `.env.example` and set:
   - `BARCODE_POS_DB` — absolute path to SQLite file (e.g. `/var/barcode-pos/pos.sqlite`)
   - `BARCODE_POS_PIN` — staff PIN (**required** when `NODE_ENV=production`)
   - `BARCODE_POS_SECRET` — random string, **≥ 16 characters** (session signing)
2. Build and start:

```bash
npm run build
NODE_ENV=production BARCODE_POS_PIN=… BARCODE_POS_SECRET=… BARCODE_POS_DB=… npm start
```

3. Open `http://127.0.0.1:3001` (default bind). Keep `HOST=127.0.0.1` unless you intentionally serve the LAN (use HTTPS + strong PIN).

### Backups

- End-of-day close copies the DB to `backups/pos-YYYY-MM-DD.sqlite` next to the database file (when `db_path` is set — automatic on startup).
- Copy `data/pos.sqlite` (or your `BARCODE_POS_DB` path) daily to external storage.

### Seed safety

`npm run seed` **refuses** to run if the database already has sales. To wipe demo data:

```bash
BARCODE_POS_SEED_CONFIRM=1 npm run seed
```

**Never** run seed on a live shop database.

## Barcode scanner (USB, offline)

No driver or SDK is required. Use a **USB or Bluetooth scanner in keyboard (HID) mode**:

1. Plug in the scanner; it acts as a keyboard.
2. Open **Register** — the **“Scan barcode or search…”** field should be focused.
3. Scan a label — the scanner types the code and sends **Enter**.
4. The app looks up **`products.barcode`** or **`products.sku`** (local SQLite) and adds the item to the cart.

**Scanner settings (from the device manual):** suffix **Enter (CR)**, no prefix unless you strip it in labels. If scans fail, confirm the barcode in **Inventory** matches the physical tag.

The register **refocuses** the scan field after sales and keeps a short **fallback buffer** if focus leaves the field briefly.

## Receipt printer (thermal, offline)

Printing uses the browser **Print** dialog (`window.print()`), which works with common **80mm / 58mm thermal** printers (Epson, XPrinter, Bixolon, etc.) when they are installed as the **default printer** on the PC.

1. Install the printer driver on the counter PC.
2. In **Chrome or Edge**, set paper to **80mm** (or 58mm) roll, margins **none/minimal**, scale **100%**.
3. Complete a sale — the receipt opens print automatically.
4. Optional: in the print dialog, disable “Headers and footers” so the browser does not add URL/date.

Receipt layout is **80mm roll width** (thermal). Browser preview on A4 can look like a strip in the corner until you select the thermal printer and 80mm paper in the print dialog.

Shop defaults match **BARCODE PWD-ISB** (Islamabad); edit under **Settings → Shop profile**.

## Smoke test (manual)

Full **interactive browser checklist** (client UAT): [docs/E2E-INTERACTIVE-TEST-GUIDE.md](docs/E2E-INTERACTIVE-TEST-GUIDE.md)

Short smoke:

1. Register — add catalog + custom item, complete sale, receipt prints.
2. Activity — sale appears; reprint works.
3. Reports — date range shows KPIs.
4. End of day — close with counted cash; register blocks new sales.
5. Reopen day — sales allowed again.
6. Settings — payment tiles save; lock screen works when PIN is enabled.

## Tests & CI

```bash
npm test              # server checkout/stock/discount tests
npm run test:e2e:api  # API smoke (server must be running on :3001)
npm run build         # client + server
```

Latest automated E2E report: [docs/E2E-TEST-RESULTS.md](docs/E2E-TEST-RESULTS.md)

## Screens

Register · Activity · Report · Products · Catalog · Import · Customers · End of day · Exports · Settings

Product images use bundled stock photos in `client/public/stock/` (by category).

## Docs

- [System spec](docs/specs/2026-09-28-barcode-pos-system.md)
- [Screen plans](docs/plans/screens/README.md)
