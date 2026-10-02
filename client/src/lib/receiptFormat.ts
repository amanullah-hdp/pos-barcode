const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function formatInvoiceNo(createdAt: string, receiptNumber: number): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return String(receiptNumber);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}-${receiptNumber}`;
}

/** Cubex-style: `27 Sep 2026 14:46:33` */
export function formatReceiptDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${day} ${mon} ${year} ${hh}:${mm}:${ss}`;
}

export { CUBEX_RECEIPT_TERMS_BODY as DEFAULT_RECEIPT_TERMS } from './cubexReceipt';

/** One entry per bullet; lines after the first (no •) continue the same bullet. */
export function parseReceiptTermsBullets(terms: string): string[] {
  const bullets: string[] = [];
  let parts: string[] = [];

  for (const raw of terms.split(/\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^terms and conditions/i.test(line)) continue;
    if (line.startsWith('•')) {
      if (parts.length) bullets.push(parts.join('\n'));
      parts = [line.replace(/^•\s*/, '')];
    } else {
      parts.push(line);
    }
  }
  if (parts.length) bullets.push(parts.join('\n'));
  return bullets;
}
