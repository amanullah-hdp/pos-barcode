# Screen plan: Import

**Route:** `/import`

## Purpose

Bulk upsert products from CSV.

## Layout

Single column max-w-lg centered in content area:

- Title in shell: Import catalog  
- Instruction card with monospace column list  
- Link: Download sample (public CSV)  
- Large dashed upload zone (icon in blue circle)  
- Primary “Import products”  
- Success/error Alert + line errors list (red soft panel)

## API

- `POST /api/import/csv` multipart
