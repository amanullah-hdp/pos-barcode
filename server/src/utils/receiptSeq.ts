import type Database from 'better-sqlite3';

/** `meta.receipt_seq` is the next receipt number to assign (not the last used). */
export function syncReceiptSequence(db: Database.Database): number {
  const maxRow = db.prepare('SELECT MAX(receipt_number) AS m FROM sales').get() as { m: number | null };
  const maxUsed = maxRow.m ?? 999;
  const nextFromSales = maxUsed + 1;

  const row = db.prepare("SELECT value FROM meta WHERE key = 'receipt_seq'").get() as
    | { value: string }
    | undefined;
  const nextFromMeta = row ? Number(row.value) : 1000;
  const next = Math.max(nextFromMeta, nextFromSales);

  db.prepare(
    `INSERT INTO meta (key, value) VALUES ('receipt_seq', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(String(next));

  return next;
}
