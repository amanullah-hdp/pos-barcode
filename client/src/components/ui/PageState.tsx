import { Button } from './Button';

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="surface mx-auto max-w-md p-6 text-center">
      <p className="text-sm font-semibold text-[var(--danger)]">Something went wrong</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function PageEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex min-h-[10rem] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      {hint ? <p className="mt-1 text-sm text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
