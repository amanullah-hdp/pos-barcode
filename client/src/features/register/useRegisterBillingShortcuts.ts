import { useEffect } from 'react';

export type RegisterBillingShortcutHandlers = {
  onStaff: () => void;
  onDiscount: () => void;
  onQuantity: () => void;
  onPayment: () => void;
  onBank: () => void;
};

function isTypingInField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === 'TEXTAREA') return true;
  if (target.tagName === 'INPUT') {
    const input = target as HTMLInputElement;
    if (input.dataset.allowFocus === 'true') return true;
    return input.type !== 'checkbox' && input.type !== 'radio';
  }
  if (target.tagName === 'SELECT') return true;
  return false;
}

/**
 * Register billing hotkeys (F9–F12, B). Capture phase so they work with scan-field focus and in Electron.
 */
export function useRegisterBillingShortcuts(enabled: boolean, handlers: RegisterBillingShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.key) {
        case 'F9':
          e.preventDefault();
          e.stopPropagation();
          handlers.onStaff();
          return;
        case 'F10':
          e.preventDefault();
          e.stopPropagation();
          handlers.onDiscount();
          return;
        case 'F11':
          e.preventDefault();
          e.stopPropagation();
          handlers.onQuantity();
          return;
        case 'F12':
          e.preventDefault();
          e.stopPropagation();
          handlers.onPayment();
          return;
        default:
          break;
      }

      if (e.key === 'b' || e.key === 'B') {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (isTypingInField(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        handlers.onBank();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [enabled, handlers]);
}
