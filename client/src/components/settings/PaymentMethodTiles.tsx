import { Banknote, Check, CreditCard, QrCode, Smartphone } from 'lucide-react';
import type { PaymentMethod, PaymentMethods } from '../../lib/api';

const meta: Record<PaymentMethod, { label: string; hint: string; icon: typeof Banknote }> = {
  cash: { label: 'Cash', hint: 'Drawer & change', icon: Banknote },
  card: { label: 'Card', hint: 'Manual terminal', icon: CreditCard },
  wallet: { label: 'Wallet', hint: 'JazzCash, Easypaisa', icon: Smartphone },
  bank_transfer: { label: 'Bank / QR', hint: 'Transfer or QR', icon: QrCode },
};

export function PaymentMethodTiles({
  value,
  onChange,
}: {
  value: PaymentMethods;
  onChange: (next: PaymentMethods) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(meta) as PaymentMethod[]).map((key) => {
        const on = value[key];
        const { label, hint, icon: Icon } = meta[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...value, [key]: !on })}
            className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
              on
                ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-sm'
                : 'border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:shadow-sm'
            }`}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                on ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--text)]">{label}</span>
              <span className="block text-xs text-[var(--text-muted)]">{hint}</span>
            </span>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                on ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border-strong)] bg-white'
              }`}
            >
              {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
