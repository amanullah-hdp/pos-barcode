import { Plus } from 'lucide-react';
import type { Product } from '../../lib/api';
import { formatPkr } from '../../lib/money';
import { categoryPillClass, productStockImage } from '../../lib/productImage';

export function ProductCard({
  product,
  onOpen,
  onQuickAdd,
  disabled,
  remaining,
}: {
  product: Product;
  onOpen: () => void;
  onQuickAdd: () => void;
  disabled?: boolean;
  remaining?: number;
}) {
  const img = productStockImage(product);
  const canAdd = (remaining ?? product.stock_qty) > 0;
  const out = !canAdd;
  const low =
    !out && product.low_stock_threshold > 0 && product.stock_qty <= product.low_stock_threshold;

  return (
    <article className="product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm transition-shadow hover:border-[var(--border-strong)] hover:shadow-md">
      <button
        type="button"
        className="product-card-media relative block w-full shrink-0 overflow-hidden bg-[var(--bg-subtle)]"
        onClick={onOpen}
        disabled={disabled || out}
      >
        <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        {out ? (
          <span className="product-card-badge absolute left-1.5 top-1.5 rounded-md bg-[var(--danger)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Out
          </span>
        ) : low ? (
          <span className="product-card-badge absolute left-1.5 top-1.5 rounded-md bg-[var(--warning)] px-1.5 py-0.5 text-[9px] font-bold text-white">
            Low
          </span>
        ) : null}
      </button>

      <div className="product-card-body flex min-h-0 flex-1 flex-col p-2">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onOpen}
          disabled={disabled || out}
        >
          <p className="product-card-title line-clamp-2 text-[11px] font-semibold leading-snug text-[var(--text)]">{product.name}</p>
          {product.category_name ? (
            <span
              className={`product-card-category mt-1 inline-block max-w-full truncate rounded px-1.5 py-px text-[9px] font-semibold ${categoryPillClass(product.category_name)}`}
            >
              {product.category_name}
            </span>
          ) : null}
        </button>

        <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-[var(--border)] pt-1.5">
          <p className="product-card-price font-mono text-[11px] font-bold tabular-nums text-[var(--text)]">{formatPkr(product.price_cents)}</p>
          <button
            type="button"
            disabled={disabled || out}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className="product-card-quick-add flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white shadow-sm transition-transform hover:bg-[var(--primary-hover)] active:scale-95 disabled:opacity-40"
            aria-label={`Add ${product.name}`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
