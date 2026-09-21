'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function ListingRowActions({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const act = (action: 'remove' | 'restore') => {
    if (action === 'remove' && !confirm('Remove this listing? It will be archived and hidden from buyers.')) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/listings/${listingId}/${action}`, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Action failed.');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => act(status === 'ARCHIVED' ? 'restore' : 'remove')}
        className={
          status === 'ARCHIVED'
            ? 'rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100'
            : 'rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50'
        }
      >
        {status === 'ARCHIVED' ? 'Restore' : 'Remove'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
