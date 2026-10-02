'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@/components/icons';

export function MarkAllReadButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={markAll}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-pill bg-plum px-4 py-2 text-xs font-semibold text-paper shadow-card transition-all duration-fast hover:-translate-y-px hover:shadow-raised disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <CheckIcon width={14} height={14} />
        Mark all as read
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
