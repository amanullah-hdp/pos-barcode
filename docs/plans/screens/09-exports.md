# Screen plan: Exports

**Route:** `/exports`

## Purpose

Download accounting CSV and summary JSON.

## Layout

- Date range row (two date inputs, styled like reference filter bar)  
- Two large link cards with icon in blue circle:  
  - Accounting CSV  
  - Summary JSON  

Hover: elevated shadow, icon circle fills blue.

## API

- `GET /api/exports/accounting.csv?from=&to=`  
- `GET /api/exports/summary.json?from=&to=`  
