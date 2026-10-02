# Screen plan: Activity

**Route:** `/activity`  
**Reference:** Billing Queue + Order History + Track Order strip

## Purpose

See today’s flow at the counter and look up past receipts without leaving operations mindset.

## Layout

```
PageHeader: Activity / Billing Queue
[Download CSV optional] [Date chip] [Open order ●]

Tabs: [ Queue ] [ History ]

── Queue tab ──
Filter pills: All | Today | Closed (day)
Table:
  # | Customer | Receipt | Time | Total | Status | Detail

── History tab ──
FilterBar: date from/to, time optional, search, filter icon
Table (reference Order History):
  # | Date & Time | Customer | Order status | Total | Payment | Detail
```

**Status rules**

- **Done** — sale completed (all rows)
- **Closed** — business day closed (badge on queue header, not per row unless day closed)

**Detail drawer**

- Lines, payment, reprint button, customer if any

## API

- `GET /api/sales?from=&to=`
- `GET /api/sales/:id`
- `GET /api/day-close/status`

## Empty / loading

- Queue empty: “No sales yet today — open Register”
- History empty: adjust filters hint

## Mobile

- Table → stacked cards per sale  
- Detail = full-screen sheet  
