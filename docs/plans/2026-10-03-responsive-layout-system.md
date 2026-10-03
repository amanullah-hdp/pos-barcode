# Responsive layout system — implementation plan

> **For agentic workers:** Review this plan with the user before coding. Do not add more one-off CSS patches; implement the structure below and remove superseded rules.

**Goal:** Replace ad-hoc compact/responsive patches with a single layout system: a proper collapsible app shell and a register workspace that reserves cart width and shows **4 product columns** when the sidebar is collapsed on shop PCs (~1147×745–1366×768).

**Ticket:** (none)

**Affected components:** `client` (design tokens, layout shell, register page, shared UI primitives)

---

## 1. Problem statement

| Issue | Root cause |
|--------|------------|
| Collapse control “breaks” the UI | Toggle sits in the **header row** next to the shop card, overlapping the main content edge; not part of a dedicated **sidebar rail**. |
| Product grid too dense (7+ columns) | `auto-fill` + tiny `minmax()` in `responsive.css` / `compact.css` fights fixed cart width; no **layout contract** between shell, catalog, and cart. |
| Cart list barely visible | Cart footer (payment, discount, total) is tall and fixed; patches only cap footer height instead of **structural regions** (header / scroll list / checkout strip). |
| “Patching” feel | Three layers (`tokens.css`, `responsive.css`, `compact.css`) + page-specific classes without one **source of truth** for breakpoints and column counts. |

---

## 2. Design principles

1. **Layout state drives geometry** — `sidebar: expanded | collapsed` and optional `viewport: compact` set CSS variables on `html`; components read variables, not unrelated media queries.
2. **Register is a 2-column grid** — Catalog zone + cart column with **min/max widths**; product column count is derived from catalog width, not global screen width alone.
3. **Shell owns the sidebar** — Brand, collapse control, and nav live in one vertical **rail**; collapse affordance is never floated over the register surface.
4. **Checkout is a sub-layout** — Cart panel = `{ order meta } | { scroll: lines } | { checkout deck }` with checkout deck collapsible or scroll-contained by design, not `max-height` hacks.
5. **One density scale** — `--density: comfortable | compact` toggled by `(max-height: 820px)` or `(max-width: 1366px)` for typography and control padding, shared across pages.

---

## 3. Target layout (desktop register, ≥1024px)

### 3.1 App shell (sidebar)

```
┌─ rail ─────────────────┐
│ [B]  Shop name      [◀]│  ← expanded: name + collapse at bottom of header block
│      Till 1            │
│ ─────────────────────  │
│ 🔍 Search (expanded)   │
│ ● POS                  │
│   Activity             │
│   …                    │
│ ─────────────────────  │
│ 🔒 Lock                │
└────────────────────────┘

Collapsed (~4.25rem):
┌────┐
│ B  │
│ ◀▶ │  ← toggle centered in rail footer OR bottom of brand stack (inside rail)
│ ●  │
│ 📋 │
│ …  │
└────┘
```

**Collapse control (UX spec):**

- **Inside the rail only** — full-width row at bottom of sidebar (above Lock) or integrated under brand as icon button **aligned with nav icons**, not beside the “B” overlapping content.
- Style: ghost button, same width as nav items, `PanelLeftClose` / `PanelLeft` icon, label “Collapse” when expanded (hidden when collapsed).
- **No** floating chevron on the shell/content boundary.

### 3.2 Register workspace

```
┌─ catalog (flex 1, min-w-0) ────────────────┬─ cart (fixed var) ─┐
│ toolbar: time, status, power               │ customer / staff    │
│ category ribbon (horizontal scroll)        │ ─────────────────── │
│ search                                     │ LINE ITEMS (flex 1) │
│ product grid: 4 columns (sidebar collapsed)│ ─────────────────── │
│ optional: track orders                     │ checkout deck       │
└────────────────────────────────────────────┴─────────────────────┘
```

**Column policy (product grid):**

| Sidebar | Cart width | Catalog min width | Product columns (target) |
|---------|------------|-------------------|---------------------------|
| Expanded | `var(--cart-w)` (~21–23rem) | remaining | **3** cols @ ≤1366px, **4** @ wider |
| Collapsed | `var(--cart-w)` (unchanged or +1rem if needed) | +~11rem vs expanded | **4** cols @ 1147–1366px, **5** @ ≥1440px |

Implementation: **`grid-template-columns: repeat(var(--register-cols), minmax(0, 1fr))`** on the product grid, where `--register-cols` is set on `html` from sidebar state + one media query (not `auto-fill`).

**Cart width:** Keep readable (~18–22rem); gain space from **collapsed sidebar**, not shrinking cart below usability (staff dropdown, payment tiles, PKR totals).

---

## 4. Architecture (files)

### 4.1 Create

| File | Responsibility |
|------|----------------|
| `client/src/design/layout.css` | Shell + register grid variables, `[data-sidebar]`, `[data-density]`, `--register-cols`, rail styles |
| `client/src/components/layout/AppSidebar.tsx` | Sidebar UI: brand, search, nav groups, collapse, footer — **no register logic** |
| `client/src/components/layout/LayoutProvider.tsx` | Context: `sidebarCollapsed`, `toggleSidebar`, `density`; syncs `html` dataset + localStorage |
| `client/src/components/register/RegisterWorkspace.tsx` | Register-only 2-col grid wrapper (catalog slot + cart slot) |
| `client/src/components/register/CartCheckoutDeck.tsx` | Extract checkout block from `CartPanel` (discount, totals, payment, CTA) |

### 4.2 Modify

| File | Change |
|------|--------|
| `AppShell.tsx` | Compose `LayoutProvider` + `AppSidebar` + `<Outlet />`; remove inline sidebar markup |
| `RegisterPage.tsx` | Use `RegisterWorkspace`; pass cart as children; remove duplicate width classes |
| `CartPanel.tsx` | Order meta + line list only in main column; delegate footer to `CartCheckoutDeck` |
| `global.css` | Import `layout.css`; drop redundant imports once migrated |
| `tokens.css` | Base spacing/radii only; **move** sidebar/cart widths to `layout.css` |

### 4.3 Remove / shrink (after migration)

| File | Action |
|------|--------|
| `compact.css` | Delete register/sidebar rules absorbed by `layout.css`; keep only if still needed for non-register pages (evaluate) |
| `responsive.css` | Keep **generic** primitives (`ui-table-wrap`, `ui-toolbar`); remove `register-product-grid`, sidebar collapse duplicates |
| `useSidebarLayout.ts` | Merge into `LayoutProvider` or re-export from it |

---

## 5. CSS variable contract

```css
/* layout.css — set on html */
--sidebar-w-expanded: 15rem;
--sidebar-w-collapsed: 4.25rem;
--sidebar-w: /* from data-sidebar */;
--cart-w: 21rem;
--register-cols: 4; /* 3 | 4 | 5 from sidebar + viewport */
--density-scale: 1; /* 0.875 when data-density=compact */
```

**Breakpoints (minimal set):**

- `lg` (1024px): desktop shell sidebar visible; register 2-column.
- `(max-width: 1366px), (max-height: 820px)`: `data-density=compact`, `--register-cols` −1 when sidebar expanded.
- `< lg`: existing mobile bottom nav + cart sheet (unchanged behavior).

---

## 6. Component behavior (atomic responsive)

Each layer owns its overflow and min-width:

| Component | Rule |
|-----------|------|
| `AppSidebar` | Fixed width rail; internal scroll for nav; collapse control in rail footer |
| `RegisterWorkspace` | `display: grid; grid-template-columns: 1fr var(--cart-w)` |
| Product grid | `repeat(var(--register-cols), minmax(0, 1fr))`; card obeys `min-w-0`, line-clamp |
| `CartPanel` | `grid-template-rows: auto 1fr auto`; middle row scrolls |
| `CartCheckoutDeck` | Compact: payment as 4-across icon row; deck scrolls inside max-height **only if** row 3 exceeds token `--cart-checkout-max` (single defined token, not scattered vh) |
| Admin pages | Keep `ui-table-wrap`, `ui-split`; no register-specific vars |

---

## 7. Implementation phases (ordered)

### Phase A — Layout foundation (no visual redesign yet)

1. Add `LayoutProvider` + `layout.css` with variables and `data-sidebar` / `data-density`.
2. Extract `AppSidebar`; move collapse toggle to **rail footer** per spec.
3. Wire `AppShell` to provider; verify expanded/collapsed persistence and keyboard focus.

**Acceptance:** Toggle stays inside rail; no overlap on register; sidebar width animates smoothly.

### Phase B — Register workspace

1. Add `RegisterWorkspace` with 2-column grid and `--register-cols` logic.
2. Replace `auto-fill` product grid with `repeat(var(--register-cols), …)`.
3. Set columns: **4 when collapsed** at 1147–1366px; document matrix in `layout.css` comments.

**Acceptance:** At 1366×768 collapsed sidebar, product grid shows **4 columns**; cart column fully visible; no horizontal page scroll.

### Phase C — Cart structure

1. Split `CartCheckoutDeck` from `CartPanel`; enforce 3-row grid on cart.
2. Tune checkout deck for compact density (payment row, smaller total type).
3. Update screen plan `docs/plans/screens/01-register.md` to match column policy.

**Acceptance:** With 3+ items in cart, line list scrolls; checkout remains reachable (deck scroll or sticky total + expand).

### Phase D — Cleanup

1. Remove duplicated rules from `compact.css` / `responsive.css`.
2. Run `npm run build -w client`; manual checklist at 1147×745, 1366×768, 1920×1080 (expanded + collapsed).
3. Desktop Windows CI build for client-facing `.exe`.

**Acceptance:** No `register-*` patch classes required for layout; one `layout.css` documents behavior.

---

## 8. Test plan

| # | Scenario | Expected |
|---|----------|----------|
| 1 | 1366×768, sidebar collapsed | 4 product columns; cart ≥21rem; collapse button inside rail |
| 2 | 1147×745, sidebar collapsed | 4 columns; cart usable; line items scroll |
| 3 | 1366×768, sidebar expanded | 3 columns acceptable; cart unchanged |
| 4 | Toggle sidebar on register | Grid columns update without reload; no layout jump over content |
| 5 | Activity / Products tables | Horizontal scroll via `ui-table-wrap` only |
| 6 | Mobile `<1024px` | Bottom nav + cart sheet unchanged |

---

## 9. Out of scope (this plan)

- Resizable cart drag handle
- User-configurable column count in Settings
- Electron window default size / fullscreen policy
- Redesign of category ribbon or product card visual brand

---

## 10. Decision log (for user confirmation)

| Decision | Proposal |
|----------|----------|
| Collapsed sidebar product columns | **4** at shop resolutions (1147–1366 width) |
| Cart width when sidebar collapsed | **Keep** ~21rem (space from sidebar, not cart shrink) |
| Collapse button placement | **Bottom of sidebar rail** (or under brand block), full-width nav style |
| Patch files | **Consolidate** into `layout.css` + delete redundant register rules after Phase D |

---

## 11. Next step

**User approves this plan** → implement **Phase A → B → C → D** in order in a single PR or four small PRs; do not add new rules to `compact.css` in the meantime.
