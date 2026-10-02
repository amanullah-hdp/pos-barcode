# Screen plan: Reports

**Route:** `/reports`  
**Reference:** Report dashboard (KPI cards, graph, favorite products, orders table)

## Purpose

Owner view: how did we perform in a period?

## Layout

```
PageHeader: Report
Actions: [Period ▼ Monthly/Weekly/Custom] [Show graph toggle] [Download]

Row 1 — four StatCards:
  Total sales | Items sold | Customers (unique) | Avg ticket
  (each with optional delta vs prior period — phase F if data heavy, else omit delta)

Row 2 — 2 cols:
  Left (~60%): ChartCard “Sales over time” (area chart, blue stroke)
  Right (~40%): “Top products” list — thumb placeholder, name, pill, “N sold”

Row 3 — full width:
  “All orders” — same table as Activity History with period from header
```

## API

- `GET /api/reports/daily?from=&to=`
- `GET /api/sales?from=&to=`

## Chart data

Aggregate `GET /api/sales` by day in client for range, or extend API later. v3: client-side group by date.

## QA

- [ ] Period changes refetch  
- [ ] Chart matches table totals  
- [ ] Top products matches report by_product  
