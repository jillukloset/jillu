'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function UserRowActions({
  userId,
  status,
  disabled,
  disabledReason,
}: {
  userId: string;
  status: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  if (disabled) {
    return <span className="text-xs text-slate-400">{disabledReason ?? '—'}</span>;
  }
  return <UserRowActionsInner userId={userId} status={status} />;
}

function UserRowActionsInner({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const act = (action: 'suspend' | 'restore') => {
    if (action === 'suspend' && !confirm('Suspend this user? They will be unable to log in.')) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, { method: 'POST' });
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
        onClick={() => act(status === 'SUSPENDED' ? 'restore' : 'suspend')}
        className={
          status === 'SUSPENDED'
            ? 'rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100'
            : 'rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50'
        }
      >
        {status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
