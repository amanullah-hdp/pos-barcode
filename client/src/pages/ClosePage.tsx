import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { PageError, PageLoading } from '../components/ui/PageState';
import { StatCard } from '../components/ui/StatCard';
import { api } from '../lib/api';
import { formatPkr, parsePkrInput } from '../lib/money';

type CloseStatus = { closed: boolean; expected_cash_cents: number; business_date: string };

export function ClosePage() {
  const [status, setStatus] = useState<CloseStatus | null>(null);
  const [counted, setCounted] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    void api
      .get<CloseStatus>('/api/day-close/status')
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={() => window.location.reload()} />;
  if (!status) return <PageError message="End-of-day status unavailable" />;

  return (
    <div className="w-full max-w-2xl space-y-6">
      <StatCard label="Expected cash" value={formatPkr(status.expected_cash_cents)} sub={status.business_date} />
      {status.closed ? (
        <Button variant="secondary" onClick={() => void api.post('/api/sales/reopen-day').then(() => window.location.reload())}>
          Reopen day
        </Button>
      ) : (
        <div className="surface space-y-4 p-5">
          <input className="field" placeholder="Counted cash PKR" value={counted} onChange={(e) => setCounted(e.target.value)} />
          <Button
            variant="primary"
            fullWidth
            className="w-full"
            onClick={() =>
              void api.post('/api/day-close/close', { counted_cash_cents: parsePkrInput(counted), notes: null }).then(() => window.location.reload())
            }
          >
            Close day
          </Button>
        </div>
      )}
    </div>
  );
}
