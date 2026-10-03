import { Banknote, CreditCard, QrCode, Smartphone } from 'lucide-react';
import type { RefObject } from 'react';
import type { PaymentMethod, Settings } from '../../lib/api';
import { formatPkr } from '../../lib/money';
import { Button } from '../ui/Button';

const payIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  wallet: Smartphone,
  bank_transfer: QrCode,
};

export function CartPayBar({
  paymentSectionRef,
  paymentRefInputRef,
  subtotal,
  discountTotal,
  total,
  settings,
  paymentMethod,
  onPaymentMethod,
  paymentRef,
  onPaymentRef,
  error,
  busy,
  dayClosed,
  cartEmpty,
  staffReady,
  onCheckout,
}: {
  paymentSectionRef: RefObject<HTMLDivElement | null>;
  paymentRefInputRef: RefObject<HTMLInputElement | null>;
  subtotal: number;
  discountTotal: number;
  total: number;
  settings: Settings | null;
  paymentMethod: PaymentMethod;
  onPaymentMethod: (m: PaymentMethod) => void;
  paymentRef: string;
  onPaymentRef: (v: string) => void;
  error: string;
  busy: boolean;
  dayClosed: boolean;
  cartEmpty: boolean;
  staffReady: boolean;
  onCheckout: () => void;
}) {
  const methods = settings
    ? (Object.entries(settings.payment_methods) as [PaymentMethod, boolean][]).filter(([, on]) => on)
    : [];

  return (
    <div className="cart-panel__paybar">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-0.5 text-sm">
          <div className="flex justify-between gap-4 text-[var(--text-secondary)]">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatPkr(subtotal)}</span>
          </div>
          {discountTotal > 0 ? (
            <div className="flex justify-between gap-4 text-[var(--success)]">
              <span>Discount</span>
              <span className="font-mono tabular-nums">−{formatPkr(discountTotal)}</span>
            </div>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Total</p>
          <p className="font-mono text-xl font-bold tabular-nums leading-tight">{formatPkr(total)}</p>
        </div>
      </div>

      <div ref={paymentSectionRef}>
        <p className="mb-1.5 text-[10px] text-[var(--text-muted)]">
          Payment <span className="font-mono">F12</span> · Bank <span className="font-mono">B</span>
        </p>
        <div className="cart-paybar__methods mb-2">
          {methods.map(([m]) => {
            const Icon = payIcons[m];
            const active = paymentMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onPaymentMethod(m)}
                className={`cart-paybar__method ${active ? 'cart-paybar__method--active' : ''}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate capitalize">{m.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {(paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') && (
        <input
          ref={paymentRefInputRef}
          className="field mb-2 py-2 text-sm"
          placeholder="Reference (optional)"
          value={paymentRef}
          onChange={(e) => onPaymentRef(e.target.value)}
          data-allow-focus="true"
        />
      )}
      {error ? <p className="mb-2 text-xs text-[var(--danger)]">{error}</p> : null}
      <Button
        variant="primary"
        size="md"
        fullWidth
        disabled={cartEmpty || dayClosed || busy || !staffReady}
        onClick={onCheckout}
      >
        {busy ? 'Processing…' : 'Place order'}
      </Button>
    </div>
  );
}
