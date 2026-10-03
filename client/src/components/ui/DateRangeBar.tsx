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
    <div className="surface ui-toolbar px-3 py-2.5 sm:px-4 sm:py-3">
      <CalendarDays className="hidden h-5 w-5 text-[var(--primary)] sm:block" />
      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--text-secondary)]">From</span>
        <input type="date" className="field w-auto max-w-full min-w-0 py-2 sm:min-w-[10.5rem]" value={from} onChange={(e) => onFrom(e.target.value)} />
      </label>
      <span className="text-sm text-[var(--text-muted)]">—</span>
      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--text-secondary)]">To</span>
        <input type="date" className="field w-auto max-w-full min-w-0 py-2 sm:min-w-[10.5rem]" value={to} onChange={(e) => onTo(e.target.value)} />
      </label>
      <Button type="button" size="sm" variant="secondary" className="ml-auto" onClick={onToday}>
        Today
      </Button>
    </div>
  );
}
