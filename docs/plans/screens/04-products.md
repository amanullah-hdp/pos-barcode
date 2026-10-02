# Screen plan: Products (Inventory)

**Route:** `/products`  
**Reference:** Order History table density + Inventory concept

## Purpose

CRUD products, see stock, highlight low stock.

## Layout

```
PageHeader: Inventory / Products
Actions: [Search] [Low stock only toggle] [+ Add product]

DataTable:
  SKU | Product | Brand | Category | Price | Stock | Actions

Add/Edit: right slide-over panel (not separate page)
  Fields: sku, barcode, name, brand, category, cost, price, stock, low stock threshold
  Primary Save (blue), Delete (danger, confirm)
```

## Visual

- Low stock row: soft orange background `--warning` tint  
- Price/stock: mono tabular  
- Category pill in table optional  

## API

- Full `/api/products`, `/api/brands`, `/api/categories` CRUD

## Empty

- No products: hero EmptyState + “Import CSV” button  
