import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { SearchField } from '../components/ui/SearchField';
import { api, type Product } from '../lib/api';
import { formatPkr, parsePkrInput } from '../lib/money';

type Brand = { id: number; name: string };
type Category = { id: number; name: string };

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    sku: '',
    barcode: '',
    name: '',
    brand_id: '' as number | '',
    category_id: '' as number | '',
    cost: '',
    price: '',
    stock_qty: '0',
    low_stock_threshold: '0',
  });

  async function reload() {
    const [p, b, c] = await Promise.all([
      api.get<Product[]>('/api/products'),
      api.get<Brand[]>('/api/brands'),
      api.get<Category[]>('/api/categories'),
    ]);
    setProducts(p);
    setBrands(b);
    setCategories(c);
  }

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode ?? '').includes(q) ||
        (p.brand_name ?? '').toLowerCase().includes(q) ||
        (p.category_name ?? '').toLowerCase().includes(q),
    );
  }, [products, query]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      sku: form.sku,
      barcode: form.barcode || null,
      name: form.name,
      brand_id: form.brand_id === '' ? null : form.brand_id,
      category_id: form.category_id === '' ? null : form.category_id,
      cost_cents: parsePkrInput(form.cost || '0'),
      price_cents: parsePkrInput(form.price),
      stock_qty: Number(form.stock_qty) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
    };
    if (editId) await api.put(`/api/products/${editId}`, body);
    else await api.post('/api/products', body);
    setPanel(false);
    setEditId(null);
    await reload();
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-md">
          <SearchField compact placeholder="Search SKU, name, barcode…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button variant="primary" className="shrink-0" onClick={() => { setPanel(true); setEditId(null); }}>
          + Add product
        </Button>
      </div>
      <div className="surface overflow-hidden">
        <div className="ui-table-wrap">
        <table className="ui-table w-full text-sm">
          <thead className="bg-[var(--bg-subtle)] text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const low = p.low_stock_threshold > 0 && p.stock_qty <= p.low_stock_threshold;
              return (
                <tr key={p.id} className={`border-t border-[var(--border)] hover:bg-[var(--bg-subtle)] ${low ? 'bg-[var(--warning-soft)]/30' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{p.brand_name ?? '—'}</td>
                  <td className="px-4 py-3 font-mono font-tabular">{formatPkr(p.price_cents)}</td>
                  <td className="px-4 py-3 font-mono">{p.stock_qty}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[var(--primary)]"
                      onClick={() => {
                        setEditId(p.id);
                        setPanel(true);
                        setForm({
                          sku: p.sku,
                          barcode: p.barcode ?? '',
                          name: p.name,
                          brand_id: p.brand_id ?? '',
                          category_id: p.category_id ?? '',
                          cost: String(p.cost_cents / 100),
                          price: String(p.price_cents / 100),
                          stock_qty: String(p.stock_qty),
                          low_stock_threshold: String(p.low_stock_threshold),
                        });
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!filtered.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  {query ? 'No products match your search' : 'No products yet'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>
      {panel ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <form onSubmit={(e) => void save(e)} className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">{editId ? 'Edit product' : 'Add product'}</h2>
            <div className="space-y-3">
              {(['sku', 'barcode', 'name'] as const).map((k) => (
                <input key={k} className="field" placeholder={k} required={k !== 'barcode'} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              ))}
              <select className="field" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value ? Number(e.target.value) : '' })}>
                <option value="">Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select className="field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : '' })}>
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input className="field" placeholder="Price PKR" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className="field" placeholder="Stock qty" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="submit" variant="primary">
                Save
              </Button>
              <Button type="button" onClick={() => setPanel(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
