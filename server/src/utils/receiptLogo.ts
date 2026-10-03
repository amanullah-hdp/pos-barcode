import fs from 'node:fs';
import { logoFilePath } from './dataDir.js';

function mimeForLogoBuffer(buf: Buffer): string {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png';
  }
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return 'image/png';
}

export function logoFileExists(): boolean {
  try {
    return fs.existsSync(logoFilePath());
  } catch {
    return false;
  }
}

/** Inline logo for thermal print (Electron/Windows often miss late-loaded /api URLs). */
export function readLogoDataUrl(): string | null {
  const file = logoFilePath();
  if (!logoFileExists()) return null;
  try {
    const buf = fs.readFileSync(file);
    if (!buf.length) return null;
    const mime = mimeForLogoBuffer(buf);
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}
