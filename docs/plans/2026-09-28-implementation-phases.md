# Barcode POS v3 — Implementation plan

> **For agentic workers:** Execute phases in order after user approval. Wipe `client/` at phase A step 1.

**Goal:** Replace UI with Bakehouse-reference light POS across all screens.

**Ticket:** N/A (personal project)

**Affected components:** client only (server retained)

---

### Phase A: Foundation

**Files:** Create `client/` from scratch with new structure under `src/design`, `src/components/ui`, `src/components/layout`.

- [ ] Remove existing `client/` directory completely.
- [ ] Scaffold Vite + React 19 + Tailwind v4 + Inter/JetBrains fonts.
- [ ] Implement tokens in `src/design/tokens.css` per system spec §4.1.
- [ ] Build primitives: Button, Input, SearchField, Select, Textarea, Card, Badge, Alert, Modal, DataTable, StatCard, EmptyState, PageHeader, FilterBar.
- [ ] Build `AppShell`: 240px sidebar (search, nav pills, footer), top bar (breadcrumb, date chip, open/closed badge, power icon → confirm end day link).
- [ ] Wire routes stub pages (placeholder EmptyState) for all 10 routes.
- [ ] Verify responsive sidebar → bottom tabs on mobile.

---

### Phase B: Register

**Files:** `src/features/register/*`, `src/pages/RegisterPage.tsx`, `RegisterShell.tsx`

- [ ] Three-column layout: sidebar (reuse AppShell nav) | catalog | cart (380px).
- [ ] Top bar inside catalog: time, “Open order” green dot / “Day closed” red.
- [ ] Category ribbon: CategoryCard per category + “All menu” with counts from API.
- [ ] SearchField with scan-on-enter (barcode API).
- [ ] ProductCard grid with placeholder image, pill from category, price, tap opens **Detail modal** (notes optional textarea, qty, “Add to cart”).
- [ ] CartPanel: walk-in customer dropdown, receipt # preview, line items with thumb, qty stepper, remove, subtotal + **TOTAL** (no tax row), payment method tiles, reference field for wallet/bank, primary **Complete sale** (blue, full width).
- [ ] Open-price quick add in cart footer.
- [ ] Checkout + print receipt integration.
- [ ] Bottom **Track order** strip: last 3 sales today (name, payment, time) — links to activity.

---

### Phase C: Activity & Reports

**Files:** `src/pages/ActivityPage.tsx`, `src/features/activity/*`, `src/pages/ReportsPage.tsx`, `src/features/reports/*`

- [ ] Activity tabs: **Queue** (today sales, All/Active/Closed filters — Active = same day not voided; Closed = day closed flag), **History** (date+time filters, table like reference Order History).
- [ ] Row actions: Detail drawer (lines, reprint).
- [ ] Reports: PageHeader + period dropdown (daily/weekly/monthly mapping to date range).
- [ ] Four StatCards: transactions, revenue, items sold, avg ticket (compute from API).
- [ ] ChartCard: revenue over days in range (lightweight SVG or chart library — keep bundle small).
- [ ] Favorite products list (from report by_product).
- [ ] All orders table with Detail link.

---

### Phase D: Inventory

**Files:** Products, Catalog, Import pages + features

- [ ] **Products:** split view — left filters (brand, category, low stock toggle), right DataTable; sticky “Add product” opens slide-over form; row edit/delete.
- [ ] **Catalog:** two cards Brands / Categories with inline add + list (same visual as reference settings cards).
- [ ] **Import:** dashed upload zone, template link, error list panel.

---

### Phase E: Customers, Close, Exports, Settings

- [ ] **Customers:** master-detail — list left, form top, history right (reference card style).
- [ ] **Close:** large expected cash StatCard, counted input, variance preview, close CTA; closed state summary.
- [ ] **Exports:** date range + two download link cards (icon circles, blue hover).
- [ ] **Settings:** sections Shop, Logo, Payment toggles — two-column on desktop.

---

### Phase F: Polish

- [ ] Focus rings, keyboard scan focus on register mount.
- [ ] Skeleton loaders for tables.
- [ ] Consistent empty states per screen.
- [ ] Print stylesheet for receipt.
- [ ] README + screenshot checklist.
- [ ] Full `npm run build` + manual QA list.

**No commit step in this plan** — user controls git.
