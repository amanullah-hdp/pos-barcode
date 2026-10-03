import { Pencil, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../lib/api';

type Row = { id: number; name: string };

function CatalogList({
  title,
  list,
  apiPath,
  onReload,
}: {
  title: string;
  list: Row[];
  apiPath: string;
  onReload: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [error, setError] = useState('');
  const singular = title === 'Brands' ? 'brand' : 'category';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.name.toLowerCase().includes(q));
  }, [list, search]);

  async function saveEdit(id: number) {
    setError('');
    try {
      await api.patch<Row>(`${apiPath}/${id}`, { name: editName });
      setEditingId(null);
      await onReload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }

  async function submitAdd(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post<Row>(apiPath, { name: addName });
      setAddName('');
      setAddOpen(false);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  }

  async function remove(id: number, name: string) {
    if (!window.confirm(`Delete ${singular} “${name}”?`)) return;
    setError('');
    try {
      await api.delete(`${apiPath}/${id}`);
      if (editingId === id) setEditingId(null);
      await onReload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <div className="surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            setAddName('');
            setError('');
            setAddOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      <div className="field mb-4 flex items-center gap-2.5 py-2">
        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
        <input
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          aria-label={`Search ${title.toLowerCase()}`}
        />
      </div>

      {error && !addOpen ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}

      <ul className="divide-y divide-[var(--border)]">
        {filtered.length === 0 ? (
          <li className="py-6 text-center text-sm text-[var(--text-muted)]">
            {list.length === 0 ? `No ${title.toLowerCase()} yet.` : 'No matches.'}
          </li>
        ) : (
          filtered.map((r) => (
            <li key={r.id} className="flex items-center gap-2 py-2">
              {editingId === r.id ? (
                <>
                  <input
                    className="field min-w-0 flex-1 py-1.5 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <Button type="button" size="sm" variant="primary" onClick={() => void saveEdit(r.id)}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-sm font-medium">{r.name}</span>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--primary)]"
                    aria-label={`Edit ${r.name}`}
                    onClick={() => {
                      setEditingId(r.id);
                      setEditName(r.name);
                      setError('');
                    }}
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)]"
                    aria-label={`Delete ${r.name}`}
                    onClick={() => void remove(r.id, r.name)}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>

      {addOpen ? (
        <Modal
          title={`Add ${singular}`}
          onClose={() => {
            setAddOpen(false);
            setAddName('');
            setError('');
          }}
        >
          <form className="space-y-4" onSubmit={(e) => void submitAdd(e)}>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Name</label>
              <input
                className="field"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder={`${singular.charAt(0).toUpperCase()}${singular.slice(1)} name`}
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAddOpen(false);
                  setAddName('');
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!addName.trim()}>
                Add
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export function CatalogPage() {
  const [brands, setBrands] = useState<Row[]>([]);
  const [categories, setCategories] = useState<Row[]>([]);

  async function reload() {
    const [b, c] = await Promise.all([api.get<Row[]>('/api/brands'), api.get<Row[]>('/api/categories')]);
    setBrands(b);
    setCategories(c);
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="ui-split ui-split--2 w-full gap-4 sm:gap-6">
      <CatalogList title="Brands" list={brands} apiPath="/api/brands" onReload={reload} />
      <CatalogList title="Categories" list={categories} apiPath="/api/categories" onReload={reload} />
    </div>
  );
}
