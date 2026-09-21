'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useTransientError } from '@/hooks/use-transient-error';

export function SaveButton({
  listingId,
  initialSaved,
  isLoggedIn,
}: {
  listingId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useTransientError();

  const toggle = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const next = !saved;
    setSaved(next);

    startTransition(async () => {
      const res = await fetch(`/api/listings/${listingId}/save`, { method: next ? 'POST' : 'DELETE' });
      if (!res.ok) {
        setSaved(!next);
        setError("Couldn't update. Try again.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        className={clsx(
          'rounded-pill border px-4 py-2.5 text-sm font-semibold transition-colors',
          saved ? 'border-ink bg-ink text-paper' : 'border-border text-ink hover:border-ink',
        )}
      >
        {saved ? 'Saved' : 'Save'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
