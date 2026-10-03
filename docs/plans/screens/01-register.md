# Screen plan: Register (Point of Sales)

**Route:** `/`  
**Reference:** Bakehouse POS — 3 columns (nav | menu grid | cart)

## Purpose

Primary till: find product → build cart → take payment → print receipt. Must work with barcode scanner (keyboard wedge).

## Layout (desktop ≥1024px)

```
┌──────────┬─────────────────────────────────────┬─────────────────┐
│ App nav  │ Catalog zone                        │ Cart panel      │
│ (shell)  │ [time] [Open order ●]        [power]│ Customer ▼      │
│          │ [Cat][Cat][Cat][Cat]...             │ #next receipt   │
│          │ [ Search........................ ]  │ ─────────────── │
│          │ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │ line items      │
│          │ │img │ │img │ │img │ │img │        │ qty +/-         │
│          │ └────┘ └────┘ └────┘ └────┘        │ ─────────────── │
│          │ ... grid (3–5 cols via layout.css)    │ Subtotal        │
│          │ [Track: Mike | Billie | ...]        │ TOTAL (bold)    │
│          │                                     │ [Pay tiles]     │
│          │                                     │ [Complete sale] │
└──────────┴─────────────────────────────────────┴─────────────────┘
```

## Components

| Block | Spec |
|-------|------|
| Category ribbon | Horizontal scroll; each card ~100px; icon (lucide mapped per category name), label, “N items”; active = blue border + soft blue bg |
| Search | Placeholder: “Search name, SKU, or scan barcode…” |
| Product card | 1:1 image area (gradient + initials fallback); name 2 lines; pill; price bottom-right; click card = modal, plus button = quick add 1 |
| Product modal | Image, category pill, description optional, notes textarea, qty stepper, blue “Add to cart (Rs. X)” |
| Cart line | 48px thumb, name, unit price, note icon (optional line note — store in memory only unless API extended), qty control |
| Payment | Only methods enabled in settings; one selected; bank/wallet shows reference input |
| CTA | Full width, 48px height, `#2563EB`, label “Complete sale” |

## States

| State | UX |
|-------|-----|
| Loading catalog | Skeleton grid 8 cards |
| Empty catalog | EmptyState + link to Import |
| Day closed | Banner + disable add/checkout; link to Close page |
| Checkout error | Alert above cart CTA |
| Success | Clear cart, toast optional, auto-print |

## API

- `GET /api/products`
- `GET /api/products?barcode=`
- `GET /api/settings`, `GET /api/day-close/status`
- `GET /api/customers`
- `POST /api/sales/checkout`

## Mobile

- Cart = bottom sheet / “Cart (n)” FAB opening full-height drawer
- Category ribbon stays horizontal scroll
- Grid 2 columns

## QA checklist

- [ ] Scan adds correct SKU  
- [ ] Category filter + search combine  
- [ ] Open price line in totals  
- [ ] Receipt prints  
- [ ] Day closed blocks sale  
