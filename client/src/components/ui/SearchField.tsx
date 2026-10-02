import { Search } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
};

export const SearchField = forwardRef<HTMLInputElement, Props>(function SearchField({ compact, className = '', ...props }, ref) {
  const pad = compact ? 'py-2.5 !pl-11 pr-3 text-sm' : 'py-3 !pl-11 pr-4';
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
      <input ref={ref} className={`field w-full ${pad} ${className}`} {...props} />
    </div>
  );
});
