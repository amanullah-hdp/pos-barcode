# Screen plan: Customers

**Route:** `/customers`  
**Reference:** Customer name on cart + history lists

## Purpose

Optional customer profiles and purchase history.

## Layout

Desktop 2-column:

```
┌─ Left ─────────────────┐  ┌─ Right ────────────────┐
│ New/Edit customer form │  │ Purchase history        │
│ (card)                 │  │ (selected customer)     │
│ Directory list         │  │ receipt cards           │
│ (selectable rows)      │  │                         │
└────────────────────────┘  └─────────────────────────┘
```

Selected row: blue soft highlight like nav active state.

## API

- `/api/customers` CRUD, `GET /api/customers/:id` for sales
