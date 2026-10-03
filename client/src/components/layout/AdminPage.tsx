import type { ReactNode } from 'react';

export function AdminPage({ description, actions, children }: { description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="animate-in w-full">
      {description || actions ? (
        <div className="admin-page-intro mb-6 flex flex-wrap items-start justify-between gap-4">
          {description ? <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
