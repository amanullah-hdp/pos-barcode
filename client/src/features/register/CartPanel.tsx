import { Banknote, CreditCard, Minus, Plus, QrCode, Smartphone, Tag, Trash2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { PaymentMethod, Settings } from '../../lib/api';
import type { DiscountMode } from '../../lib/cartDiscount';
import { lineGross } from '../../lib/cartDiscount';
import { formatPkr, formatWholePkr } from '../../lib/money';
import { Button } from '../../components/ui/Button';

export type CartLine = {
  key: string;
  label: string;
  qty: number;
  unit_price_cents: number;
  image?: string;
  is_open_price?: boolean;
  /** Fixed PKR discount for the whole line (catalog items only). */
  line_discount_cents?: number;
};

const payIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  wallet: Smartphone,
  bank_transfer: QrCode,
};

export type CartPanelHandle = {
  focusStaff: () => void;
  focusDiscount: () => void;
  focusQuantity: () => void;
  scrollToPayment: () => void;
  focusBankReference: () => void;
};

type CartPanelProps = {
  customerName: string;
  customerId: number | '';
  customers: { id: number; name: string }[];
  onCustomerChange: (id: number | '') => void;
  staffMembers: { id: number; staff_code: string; name: string }[];
  staffId: number | '';
  onStaffChange: (id: number | '') => void;
  cart: CartLine[];
  onQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  discountMode: DiscountMode;
  onDiscountMode: (m: DiscountMode) => void;
  shopDiscountPkr: string;
  onShopDiscountPkr: (v: string) => void;
  onLineDiscountPkr: (key: string, pkr: string) => void;
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
  onCheckout: () => void;
  onAddOpenPrice: (label: string, pricePkr: string) => void;
  /** Line whose quantity control F11 focuses (defaults to last cart line). */
  qtyFocusLineKey?: string | null;
};

export const CartPanel = forwardRef<CartPanelHandle, CartPanelProps>(function CartPanel(
  {
    customerName,
    customerId,
    customers,
    onCustomerChange,
    staffMembers,
    staffId,
    onStaffChange,
    cart,
    onQty,
    onRemove,
    discountMode,
    onDiscountMode,
    shopDiscountPkr,
    onShopDiscountPkr,
    onLineDiscountPkr,
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
    onCheckout,
    onAddOpenPrice,
    qtyFocusLineKey,
  },
  ref,
) {
  const [openLabel, setOpenLabel] = useState('');
  const [openPrice, setOpenPrice] = useState('');
  const [openExpanded, setOpenExpanded] = useState(false);
  const staffSelectRef = useRef<HTMLSelectElement>(null);
  const discountSectionRef = useRef<HTMLDivElement>(null);
  const shopDiscountRef = useRef<HTMLInputElement>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const paymentRefInputRef = useRef<HTMLInputElement>(null);
  const qtyControlRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lineDiscRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const discountFocusIndexRef = useRef(0);

  const discountLineKeys = useMemo(
    () => cart.filter((l) => l.key.startsWith('p-') && !l.is_open_price).map((l) => l.key),
    [cart],
  );

  useEffect(() => {
    discountFocusIndexRef.current = 0;
  }, [discountMode, discountLineKeys.join('|')]);

  useImperativeHandle(ref, () => ({
    focusStaff: () => {
      staffSelectRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      staffSelectRef.current?.focus();
    },
    focusDiscount: () => {
      discountSectionRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (discountMode === 'shop') {
        shopDiscountRef.current?.focus();
        return;
      }
      if (!discountLineKeys.length) return;
      const idx = discountFocusIndexRef.current % discountLineKeys.length;
      const key = discountLineKeys[idx]!;
      const input = lineDiscRefs.current.get(key);
      input?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      input?.focus();
      discountFocusIndexRef.current = idx + 1;
    },
    focusQuantity: () => {
      const key = qtyFocusLineKey ?? cart[0]?.key;
      if (!key) return;
      const el = qtyControlRefs.current.get(key);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      el?.focus();
    },
    scrollToPayment: () => {
      paymentSectionRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    focusBankReference: () => {
      paymentSectionRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      window.setTimeout(() => paymentRefInputRef.current?.focus(), 50);
    },
  }), [cart, discountMode, discountLineKeys, qtyFocusLineKey]);

  const methods = settings
    ? (Object.entries(settings.payment_methods) as [PaymentMethod, boolean][]).filter(([, on]) => on)
    : [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg-surface)]">
      <div className="shrink-0 border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold">{customerName}</p>
            <p className="text-xs text-[var(--text-muted)]">Current order</p>
          </div>
        </div>
        <select
          className="field mt-3 text-sm"
          value={customerId}
          onChange={(e) => onCustomerChange(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Walk-in customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="mt-3 block text-xs font-medium text-[var(--text-secondary)]">
          Staff <span className="font-normal text-[var(--text-muted)]">(F9)</span>
        </label>
        <select
          ref={staffSelectRef}
          className="field mt-1 text-sm"
          value={staffId}
          onChange={(e) => onStaffChange(e.target.value ? Number(e.target.value) : '')}
          required
        >
          <option value="">Select staff…</option>
          {staffMembers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.staff_code} — {s.name}
            </option>
          ))}
        </select>
        {!staffMembers.length ? (
          <p className="mt-2 text-xs text-[var(--warning)]">Add staff under Inventory → Staff to complete sales.</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-[var(--text-secondary)]">No item selected</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Tap a product to add</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {cart.map((line) => (
              <li key={line.key} className="flex gap-3">
                <img src={line.image ?? '/stock/default.jpg'} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-[var(--border)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{line.label}</p>
                  <p className="font-mono text-xs text-[var(--text-muted)]">{formatPkr(line.unit_price_cents)}</p>
                  <div
                    ref={(el) => {
                      if (el) qtyControlRefs.current.set(line.key, el);
                      else qtyControlRefs.current.delete(line.key);
                    }}
                    tabIndex={-1}
                    className={`mt-2 inline-flex items-center rounded-lg border bg-[var(--bg-subtle)] outline-none ${
                      qtyFocusLineKey === line.key
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary-soft)]'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <button type="button" className="px-2.5 py-1.5" onClick={() => onQty(line.key, -1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.75rem] text-center font-mono text-sm">{line.qty}</span>
                    <button type="button" className="px-2.5 py-1.5" onClick={() => onQty(line.key, 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {discountMode === 'line' && line.key.startsWith('p-') && !line.is_open_price ? (
                    <label className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="shrink-0">Disc (PKR)</span>
                      <input
                        ref={(el) => {
                          if (el) lineDiscRefs.current.set(line.key, el);
                          else lineDiscRefs.current.delete(line.key);
                        }}
                        className="field max-w-[5rem] py-1 font-mono text-sm"
                        inputMode="numeric"
                        placeholder="0"
                        value={line.line_discount_cents ? formatWholePkr(line.line_discount_cents) : ''}
                        onChange={(e) => onLineDiscountPkr(line.key, e.target.value)}
                        data-line-disc={line.key}
                        data-allow-focus="true"
                      />
                    </label>
                  ) : null}
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button type="button" className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => onRemove(line.key)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p className="font-mono text-sm font-semibold font-tabular">
                    {formatPkr(lineGross(line) - (discountMode === 'line' ? (line.line_discount_cents ?? 0) : 0))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-subtle)] px-5 py-4">
        <button
          type="button"
          disabled={dayClosed}
          onClick={() => setOpenExpanded((v) => !v)}
          className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-white/80 px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--primary)]"
        >
          <Tag className="h-4 w-4 shrink-0" />
          Custom item (open price)
        </button>
        {openExpanded ? (
          <div className="mb-3 space-y-2 rounded-xl border border-[var(--border)] bg-white p-3">
            <input
              className="field text-sm"
              placeholder="Description"
              value={openLabel}
              onChange={(e) => setOpenLabel(e.target.value)}
              data-allow-focus="true"
            />
            <input
              className="field text-sm"
              placeholder="Price (PKR)"
              inputMode="decimal"
              value={openPrice}
              onChange={(e) => setOpenPrice(e.target.value)}
              data-allow-focus="true"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              fullWidth
              disabled={!openLabel.trim() || !openPrice.trim()}
              onClick={() => {
                onAddOpenPrice(openLabel.trim(), openPrice.trim());
                setOpenLabel('');
                setOpenPrice('');
                setOpenExpanded(false);
              }}
            >
              Add custom item
            </Button>
          </div>
        ) : null}
        <div ref={discountSectionRef} className="mb-3 rounded-xl border border-[var(--border)] bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Discount <span className="font-normal normal-case text-[var(--text-muted)]">(F10 — next line)</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={dayClosed}
              onClick={() => onDiscountMode('line')}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium ${discountMode === 'line' ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]' : 'border-[var(--border)]'}`}
            >
              Per line
            </button>
            <button
              type="button"
              disabled={dayClosed}
              onClick={() => onDiscountMode('shop')}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium ${discountMode === 'shop' ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]' : 'border-[var(--border)]'}`}
            >
              Shop
            </button>
          </div>
          {discountMode === 'shop' ? (
            <label className="mt-2 flex items-center justify-between gap-2 text-sm">
              <span className="text-[var(--text-secondary)]">Shop discount (PKR)</span>
              <input
                ref={shopDiscountRef}
                className="field max-w-[6rem] py-1.5 text-right font-mono"
                inputMode="numeric"
                placeholder="0"
                value={shopDiscountPkr}
                onChange={(e) => onShopDiscountPkr(e.target.value.replace(/[^\d]/g, ''))}
                data-allow-focus="true"
              />
            </label>
          ) : (
            <p className="mt-2 text-[10px] text-[var(--text-muted)]">Catalog lines only. Open-price items cannot be discounted.</p>
          )}
        </div>
        <div className="mb-1 flex justify-between text-sm text-[var(--text-secondary)]">
          <span>Subtotal</span>
          <span className="font-mono font-tabular">{formatPkr(subtotal)}</span>
        </div>
        {discountTotal > 0 ? (
          <div className="mb-1 flex justify-between text-sm text-[var(--success)]">
            <span>Discount</span>
            <span className="font-mono font-tabular">−{formatPkr(discountTotal)}</span>
          </div>
        ) : null}
        <div className="mb-4 flex justify-between text-xl font-bold tracking-tight">
          <span>TOTAL</span>
          <span className="font-mono font-tabular">{formatPkr(total)}</span>
        </div>
        <div ref={paymentSectionRef} className="mb-1 text-xs text-[var(--text-muted)]">
          Payment <span className="font-mono">F12</span> · Bank <span className="font-mono">B</span>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {methods.map(([m]) => {
            const Icon = payIcons[m];
            const active = paymentMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onPaymentMethod(m)}
                className={`flex flex-col items-center rounded-xl border py-2.5 text-xs font-medium capitalize transition-colors ${
                  active ? 'border-[var(--primary)] bg-white text-[var(--primary)] shadow-sm' : 'border-transparent bg-white/80 text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="mb-1 h-4 w-4" strokeWidth={1.75} />
                {m.replace('_', ' ')}
              </button>
            );
          })}
        </div>
        {(paymentMethod === 'wallet' || paymentMethod === 'bank_transfer') && (
          <input
            ref={paymentRefInputRef}
            className="field mb-3"
            placeholder="Reference (optional)"
            value={paymentRef}
            onChange={(e) => onPaymentRef(e.target.value)}
            data-allow-focus="true"
          />
        )}
        {error ? <p className="mb-2 text-sm text-[var(--danger)]">{error}</p> : null}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!cart.length || dayClosed || busy || !staffMembers.length || staffId === ''}
          onClick={onCheckout}
        >
          {busy ? 'Processing…' : 'Place order'}
        </Button>
      </div>
    </div>
  );
});
