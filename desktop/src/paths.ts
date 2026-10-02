import path from 'node:path';
import { app } from 'electron';

/** Monorepo root when developing; `resources/` when packaged. */
export function bundleRoot(): string {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.resolve(app.getAppPath(), '..');
}

export function serverEntryPath(): string {
  return path.join(bundleRoot(), 'server', 'dist', 'index.js');
}

export function clientDistPath(): string {
  return path.join(bundleRoot(), 'client', 'dist');
}

/** Shop data (SQLite, uploads, backups) — never under Program Files. */
export function shopDataDir(): string {
  if (process.env.BARCODE_POS_DATA) {
    return process.env.BARCODE_POS_DATA;
  }
  if (process.platform === 'win32') {
    const base = process.env.PROGRAMDATA ?? path.join('C:', 'ProgramData');
    return path.join(base, 'BarcodePOS');
  }
  return path.join(app.getPath('userData'), 'data');
}
