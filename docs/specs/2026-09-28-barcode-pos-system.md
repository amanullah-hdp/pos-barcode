# Barcode POS — Complete system spec (UI v3)

**Reference:** Bakehouse-style light POS (blue primary, soft cards, three-zone register, activity + reports dashboards).  
**Shop:** Barcode garments — add-on counter (perfumes, belts, shoes, multi-brand apparel).  
**Constraints:** Offline, one till, one shop, PKR, English receipts, SQLite, no cloud.

---

## 1. Product goals

| Goal | Detail |
|------|--------|
| Speed at counter | Scan/search → cart → pay in minimal taps |
| Premium feel | Matches reference fidelity on **every** screen, not only register |
| Consistency | One design system; no theme switcher, no dark mode in v3 |
| v1 capability | Same backend features as existing API (sales, products, CSV, customers, reports, EOD, exports, settings) |

**Out of scope (unchanged):** tax lines, discounts, split pay, returns, multi-branch, staff login, Urdu, purchase orders.

---

## 2. Reference → Barcode mapping

| Reference (Bakehouse) | Barcode POS |
|----------------------|-------------|
| Point of Sales | **Register** — product grid + cart rail |
| Activity / Billing Queue | **Activity** — today’s sales queue + status |
| Order History | **Activity → History** tab (date/time filters) |
| Report dashboard | **Reports** — KPI row + chart + top products + ledger |
| Inventory (concept) | **Inventory** section: Products, Catalog, Import |
| Tables / floor plan | **Omitted** (not needed for counter retail) |
| Table + Dine In dropdowns | **Customer** + optional **note** on line (no table) |
| Tax 10% / Promo | **Hidden in v3 UI** (backend has no tax; promo placeholder disabled) |
| QRIS / multi pay tile | **Payment method** tiles (cash, card, wallet, bank) per settings |
| Teams / Log out | **Shop name** + “Till 1” label (no auth) |

---

## 3. Information architecture

```
App (single shell)
├── Register                    [/]
├── Activity                    [/activity]
│   ├── Tab: Queue (today)
│   └── Tab: History (range)
├── Reports                     [/reports]
├── Inventory
│   ├── Products                [/products]
│   ├── Catalog                 [/catalog]
│   └── Import                  [/import]
├── Customers                   [/customers]
├── End of day                  [/close]
├── Exports                     [/exports]
└── Settings                    [/settings]
```

**Shell:** Fixed **left app rail** (~240px desktop) with search, nav pills (icon + label), footer brand block — like reference sidebar, not icon-only strip.

**Register exception:** Full viewport height; **no** inner page max-width — three columns inside register only (nav | catalog | cart).

---

## 4. Design system (“Bakehouse light”)

### 4.1 Color

| Token | Value | Use |
|-------|--------|-----|
| `--bg-app` | `#F0F4FA` | Page backdrop (soft blue-gray) |
| `--bg-surface` | `#FFFFFF` | Cards, rails |
| `--bg-subtle` | `#F8FAFC` | Table header, category idle |
| `--primary` | `#2563EB` | Primary buttons, active nav, links |
| `--primary-hover` | `#1D4ED8` | Hover |
| `--primary-soft` | `#EFF6FF` | Active nav pill, selected category border fill |
| `--text` | `#0F172A` | Headings |
| `--text-secondary` | `#64748B` | Labels |
| `--text-muted` | `#94A3B8` | Hints |
| `--success` | `#16A34A` | Open day, paid |
| `--success-soft` | `#ECFDF5` | Badge bg |
| `--danger` | `#DC2626` | Closed, delete, variance warning |
| `--danger-soft` | `#FEF2F2` | Badge bg |
| `--warning` | `#EA580C` | Low stock |
| `--border` | `#E2E8F0` | Dividers |
| `--shadow-card` | `0 4px 24px -4px rgb(15 23 42 / 0.08)` | Floating panels |

**Category pill colors** (product tags): perfume `#FCE7F3`, apparel `#E0E7FF`, accessories `#FFEDD5`, footwear `#D1FAE5`, default `#F1F5F9`.

### 4.2 Typography

- **UI:** `Inter` (400, 500, 600, 700)
- **Money / SKU / receipt #:** `JetBrains Mono`, tabular nums

Scale: 12 / 13 / 14 / 16 / 18 / 24 / 32 px with line-height 1.4–1.2.

### 4.3 Shape & spacing

- **Radius:** 20px app window feel on main panels; 16px cards; 12px inputs; 999px pills.
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40.
- **Touch targets:** min 44px on register controls.

### 4.4 Components (shared library)

All screens compose from the same set:

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Sidebar + header slot + content |
| `RegisterShell` | Register-only 3-column layout |
| `PageHeader` | Title row, breadcrumbs, date/status chips, actions |
| `SearchField` | Icon + rounded full-width input |
| `CategoryCard` | Icon, label, count, active blue ring |
| `ProductCard` | Image area, name, category pill, price, quick add |
| `CartPanel` | Customer, lines, totals, payment, CTA |
| `DataTable` | Sortable-ready table (reports, products, history) |
| `FilterBar` | Date range, tabs (All/Active/Closed), search |
| `StatCard` | KPI + delta line |
| `ChartCard` | Simple area/line chart (reports) |
| `EmptyState` | Illustration placeholder + copy + action |
| `Modal` | Product detail / confirm delete |
| `Button` | primary / secondary / ghost / danger |
| `Badge` | status pills |
| `Dropdown` | styled select (customer, payment) |

### 4.5 Responsive

| Breakpoint | Behavior |
|------------|----------|
| `<768px` | Sidebar → bottom tab bar (5 icons); register cart → slide-over drawer |
| `768–1024px` | Narrow sidebar (icons + tooltip); product grid 3 cols |
| `≥1024px` | Full sidebar; register 4-col product grid; cart fixed width 380px |
| `≥1280px` | Register 5-col grid; activity track row visible |

---

## 5. Technical architecture

```
client/ (React 19, Vite, Tailwind v4, react-router)
  src/design/          tokens.css, components.css
  src/components/ui/   primitives
  src/components/layout/
  src/features/        register, activity, reports, inventory, ...
  src/pages/           route entry (thin)
  src/lib/             api, money, receipt

server/ (unchanged v1) Express + better-sqlite3
```

**Rules for implementation:**

1. No page-local color hex — tokens only.  
2. Every route has **loading**, **empty**, and **error** states.  
3. Register and admin share `AppShell` branding.  
4. Product images: `image_url` optional later; v3 uses **photo placeholder** gradient + optional logo from settings on receipt only.  
5. Delete current `client/` entirely before v3 scaffold; keep `server/` unless schema change needed.

---

## 6. Backend (retain)

Existing REST API under `/api/*` — no contract change for v3 UI.  
Optional later: product `image_path` column — **not required for v3 launch**.

---

## 7. Acceptance criteria (system)

- [ ] Visual match: side-by-side with reference — same density, blue CTAs, card radii, table style.  
- [ ] All 10 routes implemented and navigable.  
- [ ] Register: scan, search, category filter, open price, customer, payment, print receipt, day-closed guard.  
- [ ] Activity + Reports: real data, filters work.  
- [ ] Inventory CRUD + CSV import.  
- [ ] EOD + exports + settings.  
- [ ] `npm run build` clean; manual test script in README.  
- [ ] Lighthouse: no horizontal scroll at 390px width on non-register pages.

---

## 8. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **A** | Design tokens + UI primitives + AppShell |
| **B** | Register (full fidelity) |
| **C** | Activity + Reports |
| **D** | Inventory (products, catalog, import) |
| **E** | Customers, Close, Exports, Settings |
| **F** | Polish pass: motion, focus, print, QA checklist |

**Estimated order:** A → B → C → D → E → F (each phase shippable).

---

## 9. Confirmed decisions (2026-09-28)

| Topic | Decision |
|-------|----------|
| Primary | Blue `#2563EB` (Bakehouse-style) |
| Activity | Add `/activity` (queue + history tabs) |
| Product images | Stock photos in `public/stock/` mapped by category/SKU |
| Tax / promo in cart | Not shown |

Build approved — execute phases A–F.
