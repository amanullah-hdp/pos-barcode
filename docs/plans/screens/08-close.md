# Screen plan: End of day

**Route:** `/close`  
**Reference:** “Close order” power affordance (semantic: close business day)

## Purpose

Count cash drawer vs expected cash sales; lock register.

## Layout

- StatCard hero: Expected cash (large mono)  
- If open: counted input, notes, blue “Close day”  
- If closed: summary (counted, variance color coded), “Reopen day” secondary  

Shell header badge syncs with this state.

## API

- `GET /api/day-close/status`, `POST /api/day-close/close`, `POST /api/sales/reopen-day`
