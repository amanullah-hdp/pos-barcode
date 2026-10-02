import { useEffect, type RefObject } from 'react';

/**
 * Keeps the register scan field ready for USB HID barcode scanners (keyboard + Enter).
 * Optional fallback buffer captures scans when focus briefly leaves the field.
 */
export function useRegisterScanner({
  enabled,
  inputRef,
  onScan,
  pauseRefocus,
}: {
  enabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onScan: (code: string) => void;
  /** When true (modal open, etc.), do not steal focus. */
  pauseRefocus: boolean;
}) {
  useEffect(() => {
    if (!enabled || pauseRefocus) return;

    const el = inputRef.current;
    if (!el) return;

    const shouldKeepFocusElsewhere = () => {
      const active = document.activeElement;
      if (!active || active === el) return false;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) {
        return true;
      }
      if (active instanceof HTMLElement && active.isContentEditable) return true;
      return false;
    };

    const refocus = () => {
      if (pauseRefocus || shouldKeepFocusElsewhere()) return;
      el.focus({ preventScroll: true });
    };

    const onBlur = () => window.setTimeout(refocus, 150);
    el.addEventListener('blur', onBlur);
    if (!shouldKeepFocusElsewhere()) {
      el.focus({ preventScroll: true });
    }

    return () => el.removeEventListener('blur', onBlur);
  }, [enabled, inputRef, pauseRefocus]);

  useEffect(() => {
    if (!enabled) return;

    let buffer = '';
    let lastAt = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inTextField =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') &&
        target !== inputRef.current;

      if (e.key === 'Enter') {
        const fromInput = target === inputRef.current;
        const code = fromInput ? '' : buffer.trim();
        buffer = '';
        if (code.length >= 3 && !inTextField) {
          e.preventDefault();
          onScan(code);
        }
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      if (inTextField) return;

      const now = Date.now();
      if (now - lastAt > 120) buffer = '';
      lastAt = now;
      buffer += e.key;
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, inputRef, onScan]);
}
