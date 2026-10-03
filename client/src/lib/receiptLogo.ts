import type { Settings } from './api';

export function receiptLogoSrc(settings: Pick<Settings, 'logo_url' | 'logo_data_url'>): string | null {
  if (settings.logo_data_url) return settings.logo_data_url;
  if (!settings.logo_url) return null;
  if (settings.logo_url.startsWith('data:') || settings.logo_url.startsWith('http')) {
    return settings.logo_url;
  }
  return new URL(settings.logo_url, window.location.origin).href;
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
