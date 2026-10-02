export function formatPkr(cents: number): string {
  return `Rs. ${(cents / 100).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

/** Fixed decimals for narrow thermal receipts. */
export function formatPkrReceipt(cents: number): string {
  return (cents / 100).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Cubex legacy slip: no thousands separators (e.g. 2499.00). */
export function formatPkrReceiptCubex(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parsePkrInput(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
}

/** Whole rupees only (for discounts). */
export function parseWholePkrInput(raw: string): number {
  const n = Number.parseInt(raw.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) && n >= 0 ? n * 100 : 0;
}

export function formatWholePkr(cents: number): string {
  return String(Math.round(cents / 100));
}
