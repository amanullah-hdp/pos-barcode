import { Download, FileJson } from 'lucide-react';
import { useState } from 'react';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ExportsPage() {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="surface flex gap-2 p-4">
        <input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {[
        { href: `/api/exports/accounting.csv?from=${from}&to=${to}`, icon: Download, title: 'Accounting CSV' },
        { href: `/api/exports/summary.json?from=${from}&to=${to}`, icon: FileJson, title: 'Summary JSON' },
      ].map((l) => (
        <a key={l.title} href={l.href} className="surface flex items-center gap-4 p-5 hover:shadow-lg">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <l.icon className="h-6 w-6" />
          </span>
          <span className="font-semibold">{l.title}</span>
        </a>
      ))}
    </div>
  );
}
