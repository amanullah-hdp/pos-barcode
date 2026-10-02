# Screen plan: Settings

**Route:** `/settings`

## Purpose

Shop profile, logo, payment method toggles.

## Layout

Grid 2 cols desktop:

1. **Shop profile** card — name, address, phone, receipt footer  
2. **Logo** card — preview, upload button  
3. **Payment methods** card — checkbox tiles (blue border when on)  
4. Full width blue **Save settings**  

Footer: database path muted text.

## API

- `GET/PUT /api/settings`, `POST /api/settings/logo`
