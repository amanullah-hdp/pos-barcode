# Staff attribution (no commission engine)

**Date:** 2026-10-02

## Goal

Let the shop maintain a staff roster, pick staff on each sale, print staff on the receipt, and filter orders by staff so commission can be calculated outside the POS.

## Out of scope

- Commission percentages, rules, or payouts
- Staff login / permissions

## Data

- **`staff`:** `id`, `staff_code` (unique, shop-defined), `name`, `active`, `created_at`
- **`sales`:** `staff_id` (FK), `staff_code`, `staff_name` (snapshots at checkout)

Settings `staff_id` / `cashier_name` remain in DB for legacy installs but are removed from the Settings UI and client settings DTO.

## API

- `GET/POST/PATCH/DELETE /api/staff` — roster CRUD; delete blocked if sales reference staff
- `POST /api/sales/checkout` — `staff_id` (internal id); required when at least one active staff exists
- `GET /api/sales?from=&to=&staff_id=` — optional staff filter

## UI

- **Inventory → Staff** — add/edit/deactivate staff (code + name)
- **Register** — staff dropdown on cart; remember last selection locally
- **Settings** — remove staff ID / cashier fields
- **Activity** — staff column + filter; show filtered total for manual commission math
- **Receipt** — STAFF ID / CASHIER from sale snapshots

## Edge cases

- No active staff → checkout blocked with message to add staff
- Legacy sales without staff → show em dash on reprint; filter “All staff”
- Inactive staff hidden on register; still visible on historical orders
