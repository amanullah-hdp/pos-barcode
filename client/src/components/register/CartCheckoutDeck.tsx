import { Tag } from 'lucide-react';
import { useState, type RefObject } from 'react';
import type { DiscountMode } from '../../lib/cartDiscount';
import { Button } from '../ui/Button';

/** Right column: custom item + discount controls (scrolls). Totals/payment live in CartPayBar. */
export type CartCheckoutDeckProps = {
  discountSectionRef: RefObject<HTMLDivElement | null>;
  shopDiscountRef: RefObject<HTMLInputElement | null>;
  discountMode: DiscountMode;
  onDiscountMode: (m: DiscountMode) => void;
  shopDiscountPkr: string;
  onShopDiscountPkr: (v: string) => void;
  dayClosed: boolean;
  onAddOpenPrice: (label: string, pricePkr: string) => void;
};

export function CartCheckoutDeck({
  discountSectionRef,
  shopDiscountRef,
  discountMode,
  onDiscountMode,
  shopDiscountPkr,
  onShopDiscountPkr,
  dayClosed,
  onAddOpenPrice,
}: CartCheckoutDeckProps) {
  const [openLabel, setOpenLabel] = useState('');
  const [openPrice, setOpenPrice] = useState('');
  const [openExpanded, setOpenExpanded] = useState(false);

  return (
    <div className="cart-panel__extras">
      <button
        type="button"
        disabled={dayClosed}
        onClick={() => setOpenExpanded((v) => !v)}
        className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] bg-white px-2 py-1.5 text-left text-[10px] font-medium text-[var(--text-secondary)] hover:border-[var(--primary)]"
      >
        <Tag className="h-3.5 w-3.5 shrink-0" />
        Custom item
      </button>
      {openExpanded ? (
        <div className="mb-2 space-y-1.5 rounded-lg border border-[var(--border)] bg-white p-2">
          <input
            className="field py-1.5 text-xs"
            placeholder="Description"
            value={openLabel}
            onChange={(e) => setOpenLabel(e.target.value)}
            data-allow-focus="true"
          />
          <input
            className="field py-1.5 text-xs"
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
            Add
          </Button>
        </div>
      ) : null}

      <div ref={discountSectionRef} className="rounded-lg border border-[var(--border)] bg-white p-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Discount <span className="font-normal normal-case">(F10)</span>
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={dayClosed}
            onClick={() => onDiscountMode('line')}
            className={`flex-1 rounded-md border py-1 text-[10px] font-medium ${discountMode === 'line' ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]' : 'border-[var(--border)]'}`}
          >
            Per line
          </button>
          <button
            type="button"
            disabled={dayClosed}
            onClick={() => onDiscountMode('shop')}
            className={`flex-1 rounded-md border py-1 text-[10px] font-medium ${discountMode === 'shop' ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]' : 'border-[var(--border)]'}`}
          >
            Shop
          </button>
        </div>
        {discountMode === 'shop' ? (
          <label className="mt-2 block text-[10px] text-[var(--text-secondary)]">
            Shop (PKR)
            <input
              ref={shopDiscountRef}
              className="field mt-0.5 w-full py-1 text-right font-mono text-sm"
              inputMode="numeric"
              placeholder="0"
              value={shopDiscountPkr}
              onChange={(e) => onShopDiscountPkr(e.target.value.replace(/[^\d]/g, ''))}
              data-allow-focus="true"
            />
          </label>
        ) : (
          <p className="mt-2 text-[9px] leading-snug text-[var(--text-muted)]">Use line discount fields in the cart list.</p>
        )}
      </div>
    </div>
  );
}
