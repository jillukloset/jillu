'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const markAll = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) {
        setError("Couldn't mark all as read. Try again.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={markAll}
        disabled={pending}
        className="text-xs font-semibold text-muted underline hover:text-ink disabled:opacity-60"
      >
        Mark all as read
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
