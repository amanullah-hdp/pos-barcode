export function parseMoneyToCents(value: string | number): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Invalid money');
    return Math.round(value * 100);
  }
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) return 0;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) throw new Error(`Invalid money: ${value}`);
  return Math.round(n * 100);
}

export function centsToDecimal(cents: number): number {
  return cents / 100;
}
