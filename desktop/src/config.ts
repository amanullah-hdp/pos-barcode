import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { BrowserWindow, dialog } from 'electron';
import { shopDataDir } from './paths.js';

export type DesktopConfig = {
  pin: string;
  secret: string;
};

const CONFIG_NAME = 'desktop-config.json';

function configPath(): string {
  return path.join(shopDataDir(), CONFIG_NAME);
}

export function loadOrCreateConfig(): DesktopConfig {
  const dir = shopDataDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = configPath();
  if (fs.existsSync(file)) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as DesktopConfig;
    if (raw.pin && raw.secret && raw.secret.length >= 16) {
      return raw;
    }
  }
  const created: DesktopConfig = {
    pin: '0000',
    secret: crypto.randomBytes(32).toString('hex'),
  };
  fs.writeFileSync(file, JSON.stringify(created, null, 2), 'utf8');
  return created;
}

export async function warnDefaultPin(parentWindow: BrowserWindow | null): Promise<void> {
  const file = configPath();
  const opts = {
    type: 'warning' as const,
    title: 'Barcode POS — staff PIN',
    message: 'Default staff PIN is 0000',
    detail: `Change it under Settings after first login.\n\nConfig (PIN is stored here):\n${file}`,
    buttons: ['OK'] as string[],
  };
  if (parentWindow) {
    await dialog.showMessageBox(parentWindow, opts);
  } else {
    await dialog.showMessageBox(opts);
  }
}
