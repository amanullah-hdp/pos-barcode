import { useEffect, useMemo, useState } from 'react';
import { AdminPage } from '../components/layout/AdminPage';
import { DateRangeBar } from '../components/ui/DateRangeBar';
import { StatCard } from '../components/ui/StatCard';
import { api } from '../lib/api';
import { formatPkr } from '../lib/money';
import { productStockImage } from '../lib/productImage';
import type { Product } from '../lib/api';

type Report = {
  summary: { sale_count: number; total_cents: number };
  by_product: { name: string; sku: string; total_cents: number; qty: number }[];
};

type Sale = { id: number; receipt_number: number; total_cents: number; created_at: string; customer_name?: string };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ReportsPage() {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [report, setReport] = useState<Report | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void api.get<Report>(`/api/reports/daily?from=${from}&to=${to}`).then(setReport);
    void api.get<Sale[]>(`/api/sales?from=${from}&to=${to}`).then(setSales);
    void api.get<Product[]>('/api/products').then(setProducts);
  }, [from, to]);

  const chartPoints = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const s of sales) {
      const d = s.created_at.slice(0, 10);
      byDay.set(d, (byDay.get(d) ?? 0) + s.total_cents);
    }
    return Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sales]);

  const itemsSold = report?.by_product.reduce((n, p) => n + p.qty, 0) ?? 0;
  const avg = report && report.summary.sale_count ? report.summary.total_cents / report.summary.sale_count : 0;

  return (
    <AdminPage description="Sales performance for the selected period.">
      <div className="space-y-6">
        <DateRangeBar
          from={from}
          to={to}
          onFrom={setFrom}
          onTo={setTo}
          onToday={() => {
            const t = today();
            setFrom(t);
            setTo(t);
          }}
        />
      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total sales" value={formatPkr(report.summary.total_cents)} />
            <StatCard label="Transactions" value={report.summary.sale_count} />
            <StatCard label="Items sold" value={itemsSold} />
            <StatCard label="Avg ticket" value={formatPkr(Math.round(avg))} />
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="surface p-5 lg:col-span-3">
              <h2 className="mb-4 font-semibold">Report graph</h2>
              <svg viewBox="0 0 400 120" className="h-40 w-full text-[var(--primary)]">
                {chartPoints.length > 1 ? (
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    points={chartPoints
                      .map(([_, v], i) => {
                        const max = Math.max(...chartPoints.map(([, c]) => c), 1);
                        const x = (i / (chartPoints.length - 1)) * 380 + 10;
                        const y = 110 - (v / max) * 90;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                ) : (
                  <text x="200" y="60" textAnchor="middle" className="fill-[var(--text-muted)] text-xs">
                    Not enough data for chart
                  </text>
                )}
              </svg>
            </div>
            <div className="surface p-5 lg:col-span-2">
              <h2 className="mb-4 font-semibold">Favorite products</h2>
              <ul className="space-y-3">
                {report.by_product.slice(0, 6).map((p) => {
                  const prod = products.find((x) => x.sku === p.sku);
                  return (
                    <li key={p.sku + p.name} className="flex items-center gap-3">
                      <img src={prod ? productStockImage(prod) : '/stock/default.jpg'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{p.qty} sold</p>
                      </div>
                      <span className="font-mono text-sm font-tabular">{formatPkr(p.total_cents)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="surface overflow-hidden">
            <h2 className="border-b border-[var(--border)] px-5 py-4 font-semibold">All orders</h2>
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-subtle)] text-left text-xs text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-mono">#{s.receipt_number}</td>
                    <td className="px-4 py-3">{s.customer_name ?? 'Walk-in'}</td>
                    <td className="px-4 py-3 font-mono">{formatPkr(s.total_cents)}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(s.created_at).toLocaleString('en-PK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-[var(--text-muted)]">Loading…</p>
      )}
      </div>
    </AdminPage>
  );
}
