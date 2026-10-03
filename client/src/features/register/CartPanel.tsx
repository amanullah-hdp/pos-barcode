import { Minus, Plus, Trash2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { CartCheckoutDeck } from '../../components/register/CartCheckoutDeck';
import { CartPayBar } from '../../components/register/CartPayBar';
import type { PaymentMethod, Settings } from '../../lib/api';
import type { DiscountMode } from '../../lib/cartDiscount';
import { lineGross } from '../../lib/cartDiscount';
import { formatPkr, formatWholePkr } from '../../lib/money';

export type CartLine = {
  key: string;
  label: string;
  qty: number;
  unit_price_cents: number;
  image?: string;
  is_open_price?: boolean;
  line_discount_cents?: number;
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
  qtyFocusLineKey?: string | null;
};

export const CartPanel = forwardRef<CartPanelHandle, CartPanelProps>(function CartPanel(props, ref) {
  const {
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
  } = props;

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

  return (
    <div className="cart-panel">
      <div className="cart-panel__meta">
        <p className="mb-1.5 truncate text-xs font-semibold text-[var(--text-muted)]">{customerName}</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0">
            <span className="mb-0.5 block text-[9px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Customer</span>
            <select
              className="field py-1.5 text-xs"
              value={customerId}
              onChange={(e) => onCustomerChange(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Walk-in</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="mb-0.5 block text-[9px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              Staff (F9)
            </span>
            <select
              ref={staffSelectRef}
              className="field py-1.5 text-xs"
              value={staffId}
              onChange={(e) => onStaffChange(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Select…</option>
              {staffMembers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.staff_code} — {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!staffMembers.length ? (
          <p className="mt-1 text-[9px] text-[var(--warning)]">Add staff under Inventory → Staff.</p>
        ) : null}
      </div>

      <div className="cart-panel__split">
        <div className="cart-panel__lines">
          {cart.length === 0 ? (
            <div className="flex h-full min-h-[6rem] flex-col items-center justify-center px-2 text-center">
              <p className="text-xs font-medium text-[var(--text-secondary)]">No items yet</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Tap + on a product</p>
            </div>
          ) : (
            <ul className="cart-line-list">
              {cart.map((line) => {
                const lineTotal =
                  lineGross(line) - (discountMode === 'line' ? (line.line_discount_cents ?? 0) : 0);
                const showLineDisc =
                  discountMode === 'line' && line.key.startsWith('p-') && !line.is_open_price;

                return (
                  <li key={line.key} className="cart-line-item">
                    <img src={line.image ?? '/stock/default.jpg'} alt="" className="cart-line-item__thumb" />
                    <div className="cart-line-item__head">
                      <p className="cart-line-item__title" title={line.label}>
                        {line.label}
                      </p>
                      <p className="cart-line-item__unit">
                        {formatPkr(line.unit_price_cents)}
                        <span className="cart-line-item__unit-sep">·</span>
                        <span className="cart-line-item__unit-qty">×{line.qty}</span>
                      </p>
                    </div>
                    <div className="cart-line-item__sum">
                      <p className="cart-line-item__total">{formatPkr(lineTotal)}</p>
                      <button
                        type="button"
                        className="cart-line-item__remove"
                        onClick={() => onRemove(line.key)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="cart-line-item__controls">
                      <div
                        ref={(el) => {
                          if (el) qtyControlRefs.current.set(line.key, el);
                          else qtyControlRefs.current.delete(line.key);
                        }}
                        tabIndex={-1}
                        className={`cart-line-item__qty ${qtyFocusLineKey === line.key ? 'cart-line-item__qty--focus' : ''}`}
                      >
                        <button type="button" className="cart-line-item__qty-btn" onClick={() => onQty(line.key, -1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="cart-line-item__qty-val">{line.qty}</span>
                        <button type="button" className="cart-line-item__qty-btn" onClick={() => onQty(line.key, 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {showLineDisc ? (
                        <input
                          ref={(el) => {
                            if (el) lineDiscRefs.current.set(line.key, el);
                            else lineDiscRefs.current.delete(line.key);
                          }}
                          className="cart-line-item__disc"
                          inputMode="numeric"
                          placeholder="Line disc (PKR)"
                          value={line.line_discount_cents ? formatWholePkr(line.line_discount_cents) : ''}
                          onChange={(e) => onLineDiscountPkr(line.key, e.target.value)}
                          data-line-disc={line.key}
                          data-allow-focus="true"
                        />
                      ) : (
                        <span className="cart-line-item__controls-spacer" aria-hidden />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <CartCheckoutDeck
          discountSectionRef={discountSectionRef}
          shopDiscountRef={shopDiscountRef}
          discountMode={discountMode}
          onDiscountMode={onDiscountMode}
          shopDiscountPkr={shopDiscountPkr}
          onShopDiscountPkr={onShopDiscountPkr}
          dayClosed={dayClosed}
          onAddOpenPrice={onAddOpenPrice}
        />
      </div>

      <CartPayBar
        paymentSectionRef={paymentSectionRef}
        paymentRefInputRef={paymentRefInputRef}
        subtotal={subtotal}
        discountTotal={discountTotal}
        total={total}
        settings={settings}
        paymentMethod={paymentMethod}
        onPaymentMethod={onPaymentMethod}
        paymentRef={paymentRef}
        onPaymentRef={onPaymentRef}
        error={error}
        busy={busy}
        dayClosed={dayClosed}
        cartEmpty={!cart.length}
        staffReady={staffMembers.length > 0 && staffId !== ''}
        onCheckout={onCheckout}
      />
    </div>
  );
});
