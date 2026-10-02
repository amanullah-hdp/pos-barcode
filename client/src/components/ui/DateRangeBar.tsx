import { CalendarDays } from 'lucide-react';
import { Button } from './Button';

export function DateRangeBar({
  from,
  to,
  onFrom,
  onTo,
  onToday,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onToday: () => void;
}) {
  return (
    <div className="surface flex flex-wrap items-center gap-3 px-4 py-3">
      <CalendarDays className="hidden h-5 w-5 text-[var(--primary)] sm:block" />
      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--text-secondary)]">From</span>
        <input type="date" className="field w-auto min-w-[10.5rem] py-2" value={from} onChange={(e) => onFrom(e.target.value)} />
      </label>
      <span className="text-sm text-[var(--text-muted)]">—</span>
      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--text-secondary)]">To</span>
        <input type="date" className="field w-auto min-w-[10.5rem] py-2" value={to} onChange={(e) => onTo(e.target.value)} />
      </label>
      <Button type="button" size="sm" variant="secondary" className="ml-auto" onClick={onToday}>
        Today
      </Button>
    </div>
  );
}
