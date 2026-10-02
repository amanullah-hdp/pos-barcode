import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { PageError, PageLoading } from '../ui/PageState';

type HealthResponse = { ok: boolean; pin_required?: boolean };

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'pin' | 'ready' | 'error'>('loading');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const s = await api.get<HealthResponse>('/api/health');
      setStatus(s.pin_required ? 'pin' : 'ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach server');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/auth/login', { pin });
      setPin('');
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-app)]">
        <PageLoading label="Starting Barcode POS…" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-app)] p-4">
        <PageError message={error} onRetry={() => void loadStatus()} />
      </div>
    );
  }

  if (status === 'pin') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-app)] p-4">
        <form onSubmit={(e) => void submitPin(e)} className="surface w-full max-w-sm p-6">
          <h1 className="text-lg font-semibold">Staff PIN</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Enter the counter PIN to continue.</p>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            className="field mt-4 text-center font-mono text-lg tracking-widest"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" variant="primary" fullWidth className="mt-4" disabled={!pin || busy}>
            {busy ? 'Checking…' : 'Unlock'}
          </Button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
