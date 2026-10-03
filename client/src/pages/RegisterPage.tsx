import { Minus, Plus, Power, Shirt, Sparkles, Footprints, ShoppingBag, LayoutGrid, Watch, Gem, Baby, CloudSun, Dumbbell, Glasses, Gift, Ribbon, Briefcase } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';
import { SearchField } from '../components/ui/SearchField';
import { Button } from '../components/ui/Button';
import { RegisterWorkspace } from '../components/register/RegisterWorkspace';
import { RegisterCategories } from '../features/register/RegisterCategories';
import { ProductCard } from '../features/register/ProductCard';
import { CartPanel, type CartLine, type CartPanelHandle } from '../features/register/CartPanel';
import { useRegisterBillingShortcuts } from '../features/register/useRegisterBillingShortcuts';
import { api, type Customer, type PaymentMethod, type Product, type ReceiptPayload, type Settings, type StaffMember } from '../lib/api';
import { cartLineDiscountTotal, cartSubtotal, cartTotal, type DiscountMode } from '../lib/cartDiscount';

const LAST_STAFF_KEY = 'barcode-pos-last-staff-id';
import { formatPkr, parsePkrInput, parseWholePkrInput } from '../lib/money';
import { categoryPillClass, productStockImage } from '../lib/productImage';
import { normalizeScanCode } from '../lib/barcode';
import { cartQtyForProduct, remainingStock } from '../lib/registerStock';
import { printReceipt } from '../lib/receipt';
import { useRegisterScanner } from '../features/register/useRegisterScanner';

const categoryIcon = (name: string) => {
  const c = name.toLowerCase();
  if (name === 'All') return LayoutGrid;
  if (c.includes('perfume')) return Sparkles;
  if (c.includes('foot') || c.includes('shoe')) return Footprints;
  if (c.includes('bag')) return ShoppingBag;
  if (c.includes('belt')) return Ribbon;
  if (c.includes('watch')) return Watch;
  if (c.includes('jewelry')) return Gem;
  if (c.includes('kids')) return Baby;
  if (c.includes('outerwear')) return CloudSun;
  if (c.includes('sportswear')) return Dumbbell;
  if (c.includes('eyewear')) return Glasses;
  if (c.includes('gift')) return Gift;
  if (c.includes('scarf')) return Ribbon;
  if (c.includes('formal')) return Briefcase;
  if (c.includes('clothes') || c.includes('apparel')) return Shirt;
  if (c.includes('accessories')) return Sparkles;
  return LayoutGrid;
};

export function RegisterPage() {
  const scanRef = useRef<HTMLInputElement>(null);
  const cartPanelRef = useRef<CartPanelHandle>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [staffId, setStaffId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dayClosed, setDayClosed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [recentSales, setRecentSales] = useState<{ receipt_number: number; customer_name?: string; total_cents: number }[]>([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [discountMode, setDiscountMode] = useState<DiscountMode>('line');
  const [shopDiscountPkr, setShopDiscountPkr] = useState('');
  const [apiSupportsDiscounts, setApiSupportsDiscounts] = useState<boolean | null>(null);
  /** Latest cart/discount at click time (avoids stale state edge cases). */
  const checkoutSnapshotRef = useRef({
    cart: [] as CartLine[],
    discountMode: 'line' as DiscountMode,
    shopDiscountPkr: '',
    total: 0,
  });

  const qtyFocusLineKey = cart.length > 0 ? cart[cart.length - 1]!.key : null;

  const enabledPaymentMethods = useMemo(() => {
    if (!settings) return [] as PaymentMethod[];
    return (Object.entries(settings.payment_methods) as [PaymentMethod, boolean][])
      .filter(([, on]) => on)
      .map(([m]) => m);
  }, [settings]);

  const ensureCartVisible = useCallback(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) setMobileCartOpen(true);
  }, []);

  const billingShortcutsEnabled = !dayClosed && !modalProduct && !busy;

  const billingShortcutHandlers = useMemo(
    () => ({
      onStaff: () => {
        ensureCartVisible();
        cartPanelRef.current?.focusStaff();
      },
      onDiscount: () => {
        ensureCartVisible();
        cartPanelRef.current?.focusDiscount();
      },
      onQuantity: () => {
        ensureCartVisible();
        cartPanelRef.current?.focusQuantity();
      },
      onPayment: () => {
        ensureCartVisible();
        const methods = enabledPaymentMethods;
        if (methods.length) {
          setPaymentMethod((cur) => {
            const idx = methods.indexOf(cur);
            return methods[(idx + 1) % methods.length]!;
          });
        }
        cartPanelRef.current?.scrollToPayment();
      },
      onBank: () => {
        if (!settings?.payment_methods.bank_transfer) return;
        ensureCartVisible();
        setPaymentMethod('bank_transfer');
        cartPanelRef.current?.scrollToPayment();
        cartPanelRef.current?.focusBankReference();
      },
    }),
    [ensureCartVisible, enabledPaymentMethods, settings?.payment_methods.bank_transfer],
  );

  useRegisterBillingShortcuts(billingShortcutsEnabled, billingShortcutHandlers);

  const today = new Date().toISOString().slice(0, 10);

  const reload = useCallback(async () => {
    const [products, s, day, sales] = await Promise.all([
      api.get<Product[]>('/api/products'),
      api.get<Settings>('/api/settings'),
      api.get<{ closed: boolean }>('/api/day-close/status'),
      api.get<{ receipt_number: number; customer_name?: string; total_cents: number }[]>(`/api/sales?from=${today}&to=${today}`),
    ]);
    setCatalog(products);
    setSettings(s);
    setDayClosed(day.closed);
    setRecentSales(sales.slice(0, 5));
    const en = (Object.entries(s.payment_methods) as [PaymentMethod, boolean][]).find(([, on]) => on);
    if (en) setPaymentMethod(en[0]);
    const staffRows = await api.get<StaffMember[]>('/api/staff');
    const active = staffRows.filter((row) => row.active);
    setStaffMembers(active);
    setStaffId((prev) => {
      if (prev !== '' && active.some((row) => row.id === prev)) return prev;
      const saved = localStorage.getItem(LAST_STAFF_KEY);
      const savedId = saved ? Number(saved) : NaN;
      if (Number.isInteger(savedId) && active.some((row) => row.id === savedId)) return savedId;
      if (active.length === 1) return active[0].id;
      return '';
    });
  }, [today]);

  useEffect(() => {
    void reload();
    void api.get<Customer[]>('/api/customers').then(setCustomers);
    void api
      .get<{ features?: { discounts?: boolean } }>('/api/health')
      .then((h) => setApiSupportsDiscounts(h.features?.discounts === true))
      .catch(() => setApiSupportsDiscounts(false));
    scanRef.current?.focus();
  }, [reload]);

  useEffect(() => {
    const done = () => scanRef.current?.focus();
    document.addEventListener('receipt-print-done', done);
    return () => document.removeEventListener('receipt-print-done', done);
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of catalog) {
      const c = p.category_name ?? 'Other';
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [{ name: 'All', count: catalog.length }, ...Array.from(map.entries()).map(([name, count]) => ({ name, count }))];
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((p) => {
      if (category !== 'All' && (p.category_name ?? 'Other') !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode ?? '').includes(q);
    });
  }, [catalog, category, query]);

  const subtotal = cartSubtotal(cart);
  const shopDiscountCents = discountMode === 'shop' ? parseWholePkrInput(shopDiscountPkr) : 0;
  const discountTotal =
    discountMode === 'shop' ? shopDiscountCents : cartLineDiscountTotal(cart);
  const total = cartTotal(cart, discountMode, shopDiscountCents);
  const customerName = customers.find((c) => c.id === customerId)?.name ?? 'Walk-in customer';

  checkoutSnapshotRef.current = { cart, discountMode, shopDiscountPkr, total };

  const addLine = useCallback((p: Product, qty = 1) => {
    let message = '';
    setCart((prev) => {
      const left = remainingStock(p, prev);
      if (left <= 0) {
        message =
          p.stock_qty <= 0
            ? `${p.name} is out of stock. Update stock in Products if needed.`
            : `${p.name}: all ${p.stock_qty} in cart already.`;
        return prev;
      }
      const add = Math.min(qty, left);
      if (add < qty) {
        message = `Only ${add} of ${p.name} added (${p.stock_qty} in stock).`;
      }
      const key = `p-${p.id}`;
      const ex = prev.find((l) => l.key === key);
      if (ex) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + add } : l));
      }
      return [
        ...prev,
        { key, label: p.name, qty: add, unit_price_cents: p.price_cents, image: productStockImage(p) },
      ];
    });
    setError(message);
    if (!message) setError('');
  }, []);

  const lookupBarcode = useCallback(
    async (raw: string) => {
      const code = normalizeScanCode(raw);
      if (!code) return;
      setError('');
      try {
        addLine(await api.get<Product>(`/api/products?barcode=${encodeURIComponent(code)}`));
        setQuery('');
      } catch {
        setError(`No product for barcode “${code}”`);
      }
    },
    [addLine],
  );

  useRegisterScanner({
    enabled: !dayClosed,
    inputRef: scanRef,
    onScan: (code) => void lookupBarcode(code),
    pauseRefocus: Boolean(modalProduct) || mobileCartOpen || dayClosed || cart.length > 0,
  });

  async function onScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    await lookupBarcode(query);
  }

  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const snap = checkoutSnapshotRef.current;
      for (const line of snap.cart) {
        if (!line.key.startsWith('p-')) continue;
        const product = catalog.find((x) => x.id === Number(line.key.slice(2)));
        if (!product) continue;
        if (product.stock_qty < line.qty) {
          throw new Error(
            `${line.label}: only ${Math.max(0, product.stock_qty)} in stock — remove it or reduce quantity.`,
          );
        }
      }
      const mode = snap.discountMode;
      const shopCents = mode === 'shop' ? parseWholePkrInput(snap.shopDiscountPkr) : 0;
      const expectedTotal = snap.total;

      if (staffId === '') {
        throw new Error('Select a staff member before completing the sale.');
      }

      const result = await api.post<ReceiptPayload>('/api/sales/checkout', {
        payment_method: paymentMethod,
        payment_reference: paymentRef || null,
        customer_id: customerId === '' ? null : customerId,
        staff_id: staffId,
        shop_discount_cents: shopCents,
        lines: snap.cart.map((l) => ({
          product_id: l.key.startsWith('p-') ? Number(l.key.slice(2)) : null,
          label: l.label,
          qty: l.qty,
          unit_price_cents: l.unit_price_cents,
          is_open_price: Boolean(l.is_open_price),
          discount_cents: mode === 'line' ? (l.line_discount_cents ?? 0) : 0,
        })),
      });

      const serverTotal = result.sale.total_cents;
      const serverShopDisc = Number(result.sale.shop_discount_cents ?? 0);
      const serverLineDisc = result.lines.reduce((s, l) => s + (l.discount_cents ?? 0), 0);
      if (serverTotal !== expectedTotal) {
        throw new Error(
          `Total mismatch: cart ${formatPkr(expectedTotal)}, server ${formatPkr(serverTotal)}. ` +
            'Stop the old API on port 3001 (often node dist/index.js), then from the project folder run: npm run build && npm run dev',
        );
      }
      if (shopCents > 0 && serverShopDisc !== shopCents) {
        throw new Error(
          'Shop discount was not saved. Restart npm run dev (API) and place the order again.',
        );
      }
      if (mode === 'line' && serverLineDisc !== cartLineDiscountTotal(snap.cart)) {
        throw new Error(
          'Line discounts were not saved. Restart npm run dev (API) and place the order again.',
        );
      }

      printReceipt(result);
      setCart([]);
      setShopDiscountPkr('');
      setDiscountMode('line');
      setMobileCartOpen(false);
      localStorage.setItem(LAST_STAFF_KEY, String(staffId));
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }

  const cartUi = (
    <CartPanel
      ref={cartPanelRef}
      qtyFocusLineKey={qtyFocusLineKey}
      customerName={customerName}
      customerId={customerId}
      customers={customers}
      onCustomerChange={setCustomerId}
      staffMembers={staffMembers}
      staffId={staffId}
      onStaffChange={setStaffId}
      cart={cart}
      onQty={(key, delta) => {
        setError('');
        setCart((p) =>
          p
            .map((l) => {
              if (l.key !== key) return l;
              if (!l.key.startsWith('p-')) {
                return { ...l, qty: Math.max(1, l.qty + delta) };
              }
              const product = catalog.find((x) => x.id === Number(l.key.slice(2)));
              const max = product?.stock_qty ?? l.qty;
              const next = l.qty + delta;
              if (next > max) {
                setError(`${l.label}: only ${max} in stock.`);
                return { ...l, qty: max };
              }
              return { ...l, qty: Math.max(1, next) };
            })
            .filter((l) => l.qty > 0),
        );
      }}
      onRemove={(key) => setCart((p) => p.filter((l) => l.key !== key))}
      discountMode={discountMode}
      onDiscountMode={(m) => {
        setDiscountMode(m);
        if (m === 'shop') {
          setCart((p) => p.map((l) => ({ ...l, line_discount_cents: 0 })));
        } else {
          setShopDiscountPkr('');
        }
      }}
      shopDiscountPkr={shopDiscountPkr}
      onShopDiscountPkr={setShopDiscountPkr}
      onLineDiscountPkr={(key, pkr) => {
        const cents = parseWholePkrInput(pkr);
        setCart((p) =>
          p.map((l) => {
            if (l.key !== key) return l;
            const gross = l.qty * l.unit_price_cents;
            return { ...l, line_discount_cents: Math.min(cents, gross) };
          }),
        );
      }}
      subtotal={subtotal}
      discountTotal={discountTotal}
      total={total}
      settings={settings}
      paymentMethod={paymentMethod}
      onPaymentMethod={setPaymentMethod}
      paymentRef={paymentRef}
      onPaymentRef={setPaymentRef}
      error={error}
      busy={busy}
      dayClosed={dayClosed}
      onCheckout={() => void checkout()}
      onAddOpenPrice={(label, pricePkr) => {
        setCart((prev) => [
          ...prev,
          {
            key: `open-${crypto.randomUUID()}`,
            label,
            qty: 1,
            unit_price_cents: parsePkrInput(pricePkr),
            is_open_price: true,
          },
        ]);
      }}
    />
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {apiSupportsDiscounts === false ? (
        <div className="shrink-0 border-b border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-2 text-sm text-[var(--danger)]">
          Checkout API is out of date (discounts not supported). Stop any server on port 3001, then run{' '}
          <code className="rounded bg-white/80 px-1">npm run build && npm run dev</code> from the project root.
        </div>
      ) : null}
      <RegisterWorkspace
        cart={cartUi}
        catalog={
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="register-toolbar register-toolbar--adaptive shrink-0 space-y-3">
              <form className="register-toolbar__search" onSubmit={onScanSubmit}>
                <SearchField
                  ref={scanRef}
                  compact
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Scan barcode or search…"
                  disabled={dayClosed}
                  autoComplete="off"
                  spellCheck={false}
                />
              </form>
              <div className="register-toolbar__top flex flex-wrap items-center justify-between gap-3">
                <div className="register-toolbar__status flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 font-medium ring-1 ring-[var(--border)]">
                    {new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium ${dayClosed ? 'bg-[var(--danger-soft)] text-[var(--danger)]' : 'bg-[var(--success-soft)] text-[var(--success)]'}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${dayClosed ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'}`} />
                    {dayClosed ? 'Day closed' : 'Open order'}
                  </span>
                </div>
                <div className="register-toolbar__actions">
                  <Link
                    to="/close"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--danger)] shadow-sm transition hover:shadow-md"
                  >
                    <Power className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <RegisterCategories
                categories={categories}
                active={category}
                onSelect={setCategory}
                iconFor={categoryIcon}
              />
            </div>

            <div className="register-product-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              <div className="register-product-grid">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    remaining={remainingStock(p, cart)}
                    disabled={dayClosed}
                    onOpen={() => {
                      if (remainingStock(p, cart) <= 0) {
                        setError(
                          p.stock_qty <= 0
                            ? `${p.name} is out of stock.`
                            : `${p.name}: all available stock is already in the cart.`,
                        );
                        return;
                      }
                      setModalProduct(p);
                      setModalQty(1);
                    }}
                    onQuickAdd={() => addLine(p)}
                  />
                ))}
              </div>

              {recentSales.length > 0 ? (
                <div className="register-track-orders mt-4 border-t border-[var(--border)] pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Track order</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {recentSales.map((s) => (
                      <div key={s.receipt_number} className="surface min-w-[11rem] shrink-0 px-3 py-2.5 text-xs">
                        <p className="font-semibold">{s.customer_name ?? 'Walk-in'}</p>
                        <p className="mt-0.5 text-[var(--text-muted)]">
                          #{s.receipt_number} · {formatPkr(s.total_cents)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        }
      />

      <div className="fixed bottom-14 left-0 right-0 z-20 border-t border-[var(--border)] bg-white/95 p-3 backdrop-blur lg:hidden">
        <Button variant="primary" fullWidth onClick={() => setMobileCartOpen(true)}>
          Cart · {cart.length} · {formatPkr(total)}
        </Button>
      </div>

      {mobileCartOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileCartOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 top-12 overflow-hidden rounded-t-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {cartUi}
          </div>
        </div>
      ) : null}

      {modalProduct ? (() => {
        const maxAdd = remainingStock(modalProduct, cart);
        return (
          <Modal title="Detail menu" onClose={() => setModalProduct(null)}>
            <img src={productStockImage(modalProduct)} alt="" className="mb-3 aspect-video w-full rounded-xl object-cover" />
            {modalProduct.category_name ? (
              <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${categoryPillClass(modalProduct.category_name)}`}>{modalProduct.category_name}</span>
            ) : null}
            <h3 className="mt-2 text-lg font-semibold">{modalProduct.name}</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {modalProduct.stock_qty <= 0
                ? 'Out of stock'
                : `${maxAdd} available to add (${modalProduct.stock_qty} in inventory${cartQtyForProduct(cart, modalProduct.id) ? `, ${cartQtyForProduct(cart, modalProduct.id)} in cart` : ''})`}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-2">
                <button type="button" onClick={() => setModalQty((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center font-mono">{modalQty}</span>
                <button
                  type="button"
                  disabled={modalQty >= maxAdd}
                  onClick={() => setModalQty((q) => Math.min(maxAdd, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="primary"
                disabled={maxAdd <= 0}
                onClick={() => {
                  addLine(modalProduct, modalQty);
                  setModalProduct(null);
                }}
              >
                Add to cart · {formatPkr(modalProduct.price_cents * modalQty)}
              </Button>
            </div>
          </Modal>
        );
      })() : null}
    </div>
  );
}
