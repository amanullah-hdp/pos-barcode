import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api, type ReceiptPayload } from '../../lib/api';
import type { DiscountMode } from '../../lib/cartDiscount';
import { formatPkr, formatWholePkr, parseWholePkrInput } from '../../lib/money';
import { printReceipt } from '../../lib/receipt';

type EditLine = {
  id: number;
  label: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  discount_cents: number;
  is_open_price: boolean;
  catalog: boolean;
};

export function DiscountEditModal({
  saleId,
  onClose,
  onSaved,
}: {
  saleId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receiptNo, setReceiptNo] = useState(0);
  const [lines, setLines] = useState<EditLine[]>([]);
  const [mode, setMode] = useState<DiscountMode>('line');
  const [shopPkr, setShopPkr] = useState('');
  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get<ReceiptPayload>(`/api/sales/${saleId}`);
        setReceiptNo(data.sale.receipt_number);
        const shop = data.sale.shop_discount_cents ?? 0;
        const mapped: EditLine[] = data.lines.map((l) => {
          const open = l.is_open_price === true || l.is_open_price === 1;
          return {
            id: l.id!,
            label: l.label,
            qty: l.qty,
            unit_price_cents: l.unit_price_cents,
            line_total_cents: l.line_total_cents,
            discount_cents: l.discount_cents ?? 0,
            is_open_price: open,
            catalog: !open,
          };
        });
        setLines(mapped);
        const hasLine = mapped.some((l) => l.discount_cents > 0);
        if (shop > 0) {
          setMode('shop');
          setShopPkr(formatWholePkr(shop));
        } else if (hasLine) {
          setMode('line');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load sale');
      } finally {
        setLoading(false);
      }
    })();
  }, [saleId]);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unit_price_cents, 0);
  const shopCents = mode === 'shop' ? parseWholePkrInput(shopPkr) : 0;
  const lineDisc = mode === 'line' ? lines.reduce((s, l) => s + l.discount_cents, 0) : 0;
  const total = Math.max(0, subtotal - (mode === 'shop' ? shopCents : lineDisc));

  function setLineDisc(id: number, pkr: string) {
    const cents = parseWholePkrInput(pkr);
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const gross = l.qty * l.unit_price_cents;
        return { ...l, discount_cents: Math.min(cents, gross) };
      }),
    );
  }

  async function save(reprint: boolean) {
    setBusy(true);
    setError('');
    try {
      const payload = {
        shop_discount_cents: mode === 'shop' ? shopCents : 0,
        lines: lines.map((l) => ({
          id: l.id,
          discount_cents: mode === 'line' ? l.discount_cents : 0,
        })),
      };
      const result = await api.patch<ReceiptPayload>(`/api/sales/${saleId}/discounts`, payload);
      onSaved();
      if (reprint) printReceipt(result);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Adjust discounts · #${String(receiptNo).padStart(3, '0')}`} onClose={onClose}>
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('line');
                setShopPkr('');
              }}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium ${mode === 'line' ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)]'}`}
            >
              Per line
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('shop');
                setLines((prev) => prev.map((l) => ({ ...l, discount_cents: 0 })));
              }}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium ${mode === 'shop' ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)]'}`}
            >
              Shop
            </button>
          </div>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                <span className="min-w-0 truncate">{l.label}</span>
                {mode === 'line' && l.catalog ? (
                  <input
                    className="field w-16 py-1 text-right font-mono text-xs"
                    inputMode="numeric"
                    placeholder="0"
                    value={l.discount_cents ? formatWholePkr(l.discount_cents) : ''}
                    onChange={(e) => setLineDisc(l.id, e.target.value)}
                  />
                ) : (
                  <span className="font-mono text-xs text-[var(--text-muted)]">{formatPkr(l.line_total_cents)}</span>
                )}
              </li>
            ))}
          </ul>
          {mode === 'shop' ? (
            <label className="mt-3 flex items-center justify-between text-sm">
              <span>Shop discount (PKR)</span>
              <input
                className="field w-20 py-1.5 text-right font-mono"
                inputMode="numeric"
                value={shopPkr}
                onChange={(e) => setShopPkr(e.target.value.replace(/[^\d]/g, ''))}
              />
            </label>
          ) : null}
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Subtotal</span>
              <span className="font-mono">{formatPkr(subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>New total</span>
              <span className="font-mono">{formatPkr(total)}</span>
            </div>
          </div>
          {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => void save(false)}>
              Save
            </Button>
            <Button variant="primary" disabled={busy} onClick={() => void save(true)}>
              Save & reprint
            </Button>
          </div>
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">Line and shop discounts cannot be combined. Whole rupees only.</p>
        </>
      )}
    </Modal>
  );
}
