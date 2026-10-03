import type { ReactNode } from 'react';

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="surface min-w-0 p-4 sm:p-5">
      <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight font-tabular sm:mt-2 sm:text-2xl">{value}</p>
      {sub ? <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p> : null}
    </div>
  );
}
