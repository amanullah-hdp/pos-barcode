import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  return (
    <div className="w-full max-w-2xl">
      <div className="surface p-6">
        <p className="mb-4 text-sm text-[var(--text-secondary)]">Upsert by SKU. Brands and categories are created automatically.</p>
        <a href="/sample-products.csv" download className="mb-4 inline-block text-sm font-medium text-[var(--primary)]">
          Download template
        </a>
        <label className="mb-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-subtle)] py-12">
          <Upload className="mb-2 h-8 w-8 text-[var(--primary)]" />
          <span className="text-sm">{file?.name ?? 'Choose CSV'}</span>
          <input type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Button
          variant="primary"
          fullWidth
          className="w-full"
          disabled={!file}
          onClick={() => {
            if (!file) return;
            const fd = new FormData();
            fd.append('file', file);
            void fetch('/api/import/csv', { method: 'POST', body: fd })
              .then((r) => r.json())
              .then((d: { imported?: number; error?: string }) => setMsg(d.error ?? `Imported ${d.imported ?? 0} products`));
          }}
        >
          Import products
        </Button>
        {msg ? <p className="mt-4 text-sm">{msg}</p> : null}
      </div>
    </div>
  );
}
