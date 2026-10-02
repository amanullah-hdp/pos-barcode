# Screen plan: Catalog

**Route:** `/catalog`

## Purpose

Maintain brands and categories used on products and reports.

## Layout

Two equal columns (stack on mobile):

```
┌─ Brands ─────────────┐  ┌─ Categories ───────┐
│ [input] [Add blue]   │  │ [input] [Add blue] │
│ list rows            │  │ list rows          │
└──────────────────────┘  └──────────────────────┘
```

Cards use `surface-card`, list dividers `--border`.

## API

- `GET/POST /api/brands`, `GET/POST /api/categories`
