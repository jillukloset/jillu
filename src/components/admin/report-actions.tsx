'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  reportId: string;
  status: string;
  listingId: string | null;
  listingStatus: string | null;
  responsibleUserId: string | null;
  responsibleUserStatus: string | null;
  responsibleUserRole: string | null;
  viewerId: string;
};

export function ReportActions({
  reportId,
  status,
  listingId,
  listingStatus,
  responsibleUserId,
  responsibleUserStatus,
  responsibleUserRole,
  viewerId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const post = (url: string, body?: unknown) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Action failed.');
        return;
      }
      router.refresh();
    });
  };

  const canSuspendTarget =
    responsibleUserId && responsibleUserId !== viewerId && responsibleUserRole !== 'ADMIN';

  return (
    <div className="flex flex-col gap-4 rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap gap-2">
        {status === 'OPEN' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => post(`/api/admin/reports/${reportId}/review`)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Mark as reviewing
          </button>
        ) : null}

        {listingId ? (
          listingStatus === 'ARCHIVED' ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => post(`/api/admin/listings/${listingId}/restore`)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Restore listing
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm('Remove this listing?')) return;
                post(`/api/admin/listings/${listingId}/remove`);
              }}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Remove listing
            </button>
          )
        ) : null}

        {canSuspendTarget ? (
          responsibleUserStatus === 'SUSPENDED' ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => post(`/api/admin/users/${responsibleUserId}/restore`)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Restore user
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm('Suspend this user?')) return;
                post(`/api/admin/users/${responsibleUserId}/suspend`);
              }}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Suspend user
            </button>
          )
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="admin-note" className="text-xs font-semibold uppercase text-slate-500">
          Admin note (optional)
        </label>
        <textarea
          id="admin-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => post(`/api/admin/reports/${reportId}/resolve`, { adminNote: note || undefined })}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Resolve
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => post(`/api/admin/reports/${reportId}/dismiss`, { adminNote: note || undefined })}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Dismiss
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
