import { Pencil, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminPage } from '../components/layout/AdminPage';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';

export type StaffMember = {
  id: number;
  staff_code: string;
  name: string;
  active: number;
  created_at?: string;
};

export function StaffPage() {
  const [list, setList] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addName, setAddName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');

  async function reload() {
    const rows = await api.get<StaffMember[]>('/api/staff');
    setList(rows);
  }

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) => s.staff_code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [list, search]);

  async function submitAdd(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/staff', { staff_code: addCode.trim(), name: addName.trim() });
      setAddCode('');
      setAddName('');
      setAddOpen(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  }

  async function saveEdit(id: number) {
    setError('');
    try {
      await api.patch(`/api/staff/${id}`, {
        staff_code: editCode.trim(),
        name: editName.trim(),
      });
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function toggleActive(row: StaffMember) {
    setError('');
    try {
      await api.patch(`/api/staff/${row.id}`, { active: !row.active });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function remove(row: StaffMember) {
    if (!window.confirm(`Delete staff “${row.name}” (ID ${row.staff_code})?`)) return;
    setError('');
    try {
      await api.delete(`/api/staff/${row.id}`);
      if (editingId === row.id) setEditingId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <AdminPage description="Staff IDs print on receipts and link each sale for commission tracking outside the POS.">
      <div className="surface mx-auto max-w-2xl p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Staff</h2>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setAddCode('');
              setAddName('');
              setError('');
              setAddOpen(true);
            }}
          >
            Add staff
          </Button>
        </div>

        <div className="field mb-4 flex items-center gap-2.5 py-2">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or name…"
            aria-label="Search staff"
          />
        </div>

        {error && !addOpen ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}

        <ul className="divide-y divide-[var(--border)]">
          {filtered.length === 0 ? (
            <li className="py-8 text-center text-sm text-[var(--text-muted)]">
              {list.length === 0 ? 'No staff yet. Add your team to enable checkout.' : 'No matches.'}
            </li>
          ) : (
            filtered.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-2 py-3">
                {editingId === row.id ? (
                  <>
                    <input
                      className="field w-24 py-1.5 font-mono text-sm"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      aria-label="Staff ID"
                    />
                    <input
                      className="field min-w-0 flex-1 py-1.5 text-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      aria-label="Name"
                      autoFocus
                    />
                    <Button type="button" size="sm" variant="primary" onClick={() => void saveEdit(row.id)}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-sm font-semibold">{row.staff_code}</span>
                    <span className="min-w-0 flex-1 text-sm font-medium">{row.name}</span>
                    {row.active ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="neutral">Inactive</Badge>
                    )}
                    <button
                      type="button"
                      className="rounded-lg px-2 py-1 text-xs text-[var(--primary)] hover:bg-[var(--bg-subtle)]"
                      onClick={() => void toggleActive(row)}
                    >
                      {row.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--primary)]"
                      aria-label={`Edit ${row.name}`}
                      onClick={() => {
                        setEditingId(row.id);
                        setEditCode(row.staff_code);
                        setEditName(row.name);
                        setError('');
                      }}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)]"
                      aria-label={`Delete ${row.name}`}
                      onClick={() => void remove(row)}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {addOpen ? (
        <Modal
          title="Add staff"
          onClose={() => {
            setAddOpen(false);
            setError('');
          }}
        >
          <form className="space-y-4" onSubmit={(e) => void submitAdd(e)}>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Staff ID</label>
              <input
                className="field font-mono"
                value={addCode}
                onChange={(e) => setAddCode(e.target.value)}
                placeholder="e.g. 75"
                autoFocus
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">Must be unique. Prints on the receipt.</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Name</label>
              <input
                className="field"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Display name (cashier line)"
              />
            </div>
            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!addCode.trim() || !addName.trim()}>
                Add
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </AdminPage>
  );
}
