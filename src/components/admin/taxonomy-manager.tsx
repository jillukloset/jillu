'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Entry = { id: string; name: string; slug: string; isActive: boolean };

export function TaxonomyManager({ kindPath, entries }: { kindPath: 'categories' | 'brands' | 'vibes'; entries: Entry[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const call = (fn: () => Promise<Response>) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Action failed.');
        return;
      }
      router.refresh();
    });
  };

  const create = () => {
    if (!newName.trim()) return;
    call(() =>
      fetch(`/api/admin/taxonomy/${kindPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      }),
    );
    setNewName('');
  };

  const rename = (id: string) => {
    if (!editingName.trim()) return;
    call(() =>
      fetch(`/api/admin/taxonomy/${kindPath}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      }),
    );
    setEditingId(null);
  };

  const toggle = (id: string, isActive: boolean) => {
    call(() =>
      fetch(`/api/admin/taxonomy/${kindPath}/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New name…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={pending}
          onClick={create}
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white"
        >
          Add
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="py-2">Name</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-100">
              <td className="py-2">
                {editingId === entry.id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    autoFocus
                  />
                ) : (
                  <span className={entry.isActive ? '' : 'text-slate-400'}>{entry.name}</span>
                )}
              </td>
              <td className="py-2">
                <span
                  className={
                    entry.isActive
                      ? 'rounded-pill bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'
                      : 'rounded-pill bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600'
                  }
                >
                  {entry.isActive ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td className="py-2 text-right">
                <div className="flex justify-end gap-2">
                  {editingId === entry.id ? (
                    <>
                      <button type="button" onClick={() => rename(entry.id)} className="text-xs font-semibold text-slate-700 underline">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-500 underline">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditingName(entry.name);
                      }}
                      className="text-xs font-semibold text-slate-700 underline"
                    >
                      Rename
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(entry.id, entry.isActive)}
                    className="text-xs font-semibold text-slate-700 underline"
                  >
                    {entry.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
