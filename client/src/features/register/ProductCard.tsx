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
  /** How many more can be added (after cart). Omit to use full stock_qty. */
  remaining?: number;
}) {
  const img = productStockImage(product);
  const canAdd = (remaining ?? product.stock_qty) > 0;
  const out = !canAdd;
  const low =
    !out && product.low_stock_threshold > 0 && product.stock_qty <= product.low_stock_threshold;

  return (
    <article className="group surface overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-subtle)] sm:aspect-square">
        <button type="button" className="block h-full w-full" onClick={onOpen} disabled={disabled || out}>
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </button>
        {out ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--danger)]">
            Out of stock
          </span>
        ) : low ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
            Low
          </span>
        ) : null}
        <button
          type="button"
          disabled={disabled || out}
          onClick={onQuickAdd}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-105 disabled:opacity-40"
          aria-label={`Add ${product.name}`}
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
      <button type="button" className="w-full p-3.5 text-left" onClick={onOpen} disabled={disabled || out}>
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</p>
          <p className="shrink-0 font-mono text-sm font-bold font-tabular">{formatPkr(product.price_cents)}</p>
        </div>
        {product.category_name ? (
          <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${categoryPillClass(product.category_name)}`}>
            {product.category_name}
          </span>
        ) : null}
      </button>
    </article>
  );
}
