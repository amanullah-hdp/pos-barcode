import type { Settings } from './api';

/** Max pixel width/height for thermal raster (Electron print-safe PNG). */
const RECEIPT_LOGO_MAX_PX = 480;

export function receiptLogoSrc(settings: Pick<Settings, 'logo_url' | 'logo_data_url'>): string | null {
  if (settings.logo_data_url) return settings.logo_data_url;
  if (!settings.logo_url) return null;
  if (settings.logo_url.startsWith('data:') || settings.logo_url.startsWith('http')) {
    return settings.logo_url;
  }
  return new URL(settings.logo_url, window.location.origin).href;
}

/** Load logo bytes even when checkout payload omitted logo_data_url (older API). */
export async function resolveReceiptLogo(
  settings: Pick<Settings, 'logo_url' | 'logo_data_url'>,
): Promise<string | null> {
  const inline = receiptLogoSrc(settings);
  if (inline?.startsWith('data:')) return inline;
  const url = inline ?? (settings.logo_url ? new URL(settings.logo_url, window.location.origin).href : null);
  if (!url) return null;
  try {
    const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('read logo'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Rasterize to PNG — Chromium/Electron thermal print often drops WebP or remote imgs. */
export function bakeReceiptLogo(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = Math.max(img.naturalWidth, img.naturalHeight, 1);
      const scale = Math.min(1, RECEIPT_LOGO_MAX_PX / maxSide);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('logo load failed'));
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
  });
}

export async function prepareReceiptLogoForPrint(
  settings: Pick<Settings, 'logo_url' | 'logo_data_url'>,
): Promise<string | null> {
  const raw = await resolveReceiptLogo(settings);
  if (!raw) return null;
  try {
    return await bakeReceiptLogo(raw);
  } catch {
    return raw.startsWith('data:') ? raw : null;
  }
}

export function waitForImages(root: ParentNode, timeoutMs = 4000): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  if (!imgs.length) return Promise.resolve();

  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const finish = () => resolve();
          img.addEventListener('load', finish, { once: true });
          img.addEventListener('error', finish, { once: true });
          window.setTimeout(finish, timeoutMs);
        }),
    ),
  ).then(() => undefined);
}
