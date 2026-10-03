import { useEffect, useState } from 'react';
import { DiscountEditModal } from '../components/activity/DiscountEditModal';
import { AdminPage } from '../components/layout/AdminPage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { printReceipt, type ReceiptPayload } from '../lib/receipt';
import { api, type StaffMember } from '../lib/api';
import { formatPkr } from '../lib/money';

type Sale = {
  id: number;
  receipt_number: number;
  total_cents: number;
  payment_method: string;
  created_at: string;
  customer_name?: string;
  staff_code?: string | null;
  staff_name?: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ActivityPage() {
  const [tab, setTab] = useState<'queue' | 'history'>('queue');
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [sales, setSales] = useState<Sale[]>([]);
  const [dayClosed, setDayClosed] = useState(false);
  const [discountSaleId, setDiscountSaleId] = useState<number | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffFilter, setStaffFilter] = useState<number | ''>('');

  useEffect(() => {
    void api.get<StaffMember[]>('/api/staff').then(setStaffList);
  }, []);

  useEffect(() => {
    void api.get<{ closed: boolean }>('/api/day-close/status').then((d) => setDayClosed(d.closed));
  }, []);

  const reloadSales = () => {
    const f = tab === 'queue' ? today() : from;
    const t = tab === 'queue' ? today() : to;
    const q =
      staffFilter === ''
        ? `/api/sales?from=${f}&to=${t}`
        : `/api/sales?from=${f}&to=${t}&staff_id=${staffFilter}`;
    void api.get<Sale[]>(q).then(setSales);
  };

  useEffect(() => {
    reloadSales();
  }, [tab, from, to, staffFilter]);

  const filteredTotal = sales.reduce((sum, s) => sum + s.total_cents, 0);

  return (
    <AdminPage description="Billing queue and order history.">
      <div className="ui-toolbar mb-4">
        <button type="button" onClick={() => setTab('queue')} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === 'queue' ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>
          Queue
        </button>
        <button type="button" onClick={() => setTab('history')} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === 'history' ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>
          History
        </button>
        {dayClosed ? <Badge tone="danger">Day closed</Badge> : <Badge tone="success">Open</Badge>}
      </div>
      <div className="ui-toolbar mb-4">
        {tab === 'history' ? (
          <>
            <input type="date" className="field w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="self-center text-[var(--text-muted)]">to</span>
            <input type="date" className="field w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        ) : null}
        <select
          className="field w-auto min-w-[10rem] text-sm"
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value ? Number(e.target.value) : '')}
          aria-label="Filter by staff"
        >
          <option value="">All staff</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.staff_code} — {s.name}
              {!s.active ? ' (inactive)' : ''}
            </option>
          ))}
        </select>
        {staffFilter !== '' && sales.length > 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            {sales.length} order{sales.length === 1 ? '' : 's'} · {formatPkr(filteredTotal)} total
          </p>
        ) : null}
      </div>
      <div className="surface overflow-hidden">
        <div className="ui-table-wrap">
        <table className="ui-table w-full text-sm">
          <thead className="bg-[var(--bg-subtle)] text-left text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Date & time</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-subtle)]">
                <td className="px-4 py-3 font-mono">{String(s.receipt_number).padStart(3, '0')}</td>
                <td className="px-4 py-3">{new Date(s.created_at).toLocaleString('en-PK')}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {s.staff_code ? (
                    <>
                      {s.staff_code}
                      {s.staff_name ? <span className="ml-1 font-sans text-[var(--text-muted)]">{s.staff_name}</span> : null}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">{s.customer_name ?? 'Walk-in'}</td>
                <td className="px-4 py-3 font-mono font-tabular">{formatPkr(s.total_cents)}</td>
                <td className="px-4 py-3 capitalize">{s.payment_method.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="text-[var(--primary)]" onClick={() => setDiscountSaleId(s.id)}>
                      Discounts
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[var(--primary)]" onClick={() => void api.get<ReceiptPayload>(`/api/sales/${s.id}`).then(printReceipt)}>
                      Reprint
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!sales.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  No orders in this view
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>
      {discountSaleId !== null ? (
        <DiscountEditModal
          saleId={discountSaleId}
          onClose={() => setDiscountSaleId(null)}
          onSaved={reloadSales}
        />
      ) : null}
    </AdminPage>
  );
}
