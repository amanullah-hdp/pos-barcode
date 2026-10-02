import type { ReceiptPayload } from './api';
export type { ReceiptPayload };

export function printReceipt(payload: ReceiptPayload) {
  document.dispatchEvent(new CustomEvent('receipt-print', { detail: payload }));
}
