import type { ReactNode } from 'react';

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="surface p-5">
      <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight font-tabular">{value}</p>
      {sub ? <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p> : null}
    </div>
  );
}
