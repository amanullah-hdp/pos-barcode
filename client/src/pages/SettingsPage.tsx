import { useEffect, useState } from 'react';
import { PaymentMethodTiles } from '../components/settings/PaymentMethodTiles';
import { Button } from '../components/ui/Button';
import { PageError, PageLoading } from '../components/ui/PageState';
import { DEFAULT_RECEIPT_TERMS } from '../lib/receiptFormat';
import { api, uploadLogo, type Settings } from '../lib/api';

export function SettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    void api
      .get<Settings>('/api/settings')
      .then(setForm)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={() => window.location.reload()} />;
  if (!form) return <PageError message="Settings not found" />;

  return (
    <form
      className="grid w-full gap-6 lg:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void api.put<Settings>('/api/settings', form).then((s) => {
          setForm(s);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        });
      }}
    >
      <div className="surface space-y-3 p-5">
        <h2 className="text-base font-semibold">Shop profile</h2>
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Shop name</label>
        <input className="field" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Address (one line per receipt row)</label>
        <textarea className="field" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Receipt thank-you line</label>
        <input className="field" value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Phone (Cubex: one line, space-separated)</label>
        <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="surface space-y-3 p-5">
        <h2 className="text-base font-semibold">Receipt print (thermal)</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Preview on A4 may look small or off-centre until you choose your <strong>80mm thermal</strong> printer, paper
          width 80mm, margins none, scale 100%, and turn off browser headers/footers.
        </p>
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Logo text (if no image)</label>
        <input className="field" value={form.receipt_brand} onChange={(e) => setForm({ ...form, receipt_brand: e.target.value })} />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Till no</label>
        <input className="field" value={form.till_no} onChange={(e) => setForm({ ...form, till_no: e.target.value })} />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">WhatsApp (feedback line)</label>
        <input className="field" value={form.feedback_whatsapp} onChange={(e) => setForm({ ...form, feedback_whatsapp: e.target.value })} />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Terms &amp; conditions (bullets only; heading prints automatically)</label>
        <textarea
          className="field font-mono text-xs"
          rows={10}
          value={form.receipt_terms}
          placeholder={DEFAULT_RECEIPT_TERMS}
          onChange={(e) => setForm({ ...form, receipt_terms: e.target.value })}
        />
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Powered by line</label>
        <input
          className="field"
          value={form.receipt_powered_by}
          placeholder="www.cubexretail.com"
          onChange={(e) => setForm({ ...form, receipt_powered_by: e.target.value })}
        />
      </div>
      <div className="surface p-5">
        <h2 className="mb-3 text-base font-semibold">Receipt logo</h2>
        {form.logo_url ? (
          <img src={form.logo_url} alt="" className="mb-4 max-h-24 rounded-xl border border-[var(--border)] object-contain p-2" />
        ) : (
          <div className="mb-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)]">
            No logo
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm font-medium hover:border-[var(--primary)]">
          Upload logo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadLogo(e.target.files[0]).then(setForm)} />
        </label>
      </div>
      <div className="surface p-5 lg:col-span-2">
        <h2 className="mb-1 text-base font-semibold">Payment methods</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">Choose which options appear at checkout.</p>
        <PaymentMethodTiles value={form.payment_methods} onChange={(payment_methods) => setForm({ ...form, payment_methods })} />
      </div>
      <div className="flex items-center gap-3 lg:col-span-2">
        <Button type="submit" variant="primary">
          Save settings
        </Button>
        {saved ? <span className="text-sm font-medium text-[var(--success)]">Saved</span> : null}
      </div>
    </form>
  );
}
