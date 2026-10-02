import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { api, type Customer } from '../lib/api';
import { formatPkr } from '../lib/money';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<{ receipt_number: number; total_cents: number; created_at: string }[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    void api.get<Customer[]>('/api/customers').then(setCustomers);
  }, []);

  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <form
          className="surface space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void api.post('/api/customers', form).then(() => {
              setForm({ name: '', phone: '', email: '' });
              void api.get<Customer[]>('/api/customers').then(setCustomers);
            });
          }}
        >
          <h2 className="font-semibold">New customer</h2>
          <input className="field" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button type="submit" variant="primary">
            Add
          </Button>
        </form>
        <div className="surface overflow-hidden">
          {customers.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`flex w-full border-b border-[var(--border)] px-4 py-3 text-left ${selected === c.id ? 'bg-[var(--primary-soft)]' : ''}`}
              onClick={() => void api.get<{ sales: typeof history }>(`/api/customers/${c.id}`).then((d) => { setSelected(c.id); setHistory(d.sales); })}
            >
              <span className="font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="surface p-5">
        <h2 className="mb-4 font-semibold">Purchase history</h2>
        {history.map((s) => (
          <div key={s.receipt_number} className="mb-2 rounded-xl bg-[var(--bg-subtle)] px-4 py-3 text-sm">
            <span className="font-mono">#{s.receipt_number}</span> · {formatPkr(s.total_cents)}
          </div>
        ))}
        {!history.length ? <p className="text-sm text-[var(--text-muted)]">Select a customer</p> : null}
      </div>
    </div>
  );
}
