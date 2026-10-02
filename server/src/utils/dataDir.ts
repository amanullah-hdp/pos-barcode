import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function barcodeDataDir(): string {
  const dir =
    process.env.BARCODE_POS_DATA ??
    (process.env.BARCODE_POS_DB
      ? path.dirname(process.env.BARCODE_POS_DB)
      : path.join(os.homedir(), '.barcode-pos'));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function uploadsDir(): string {
  const dir = path.join(barcodeDataDir(), 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function logoFilePath(): string {
  return path.join(uploadsDir(), 'logo.png');
}
