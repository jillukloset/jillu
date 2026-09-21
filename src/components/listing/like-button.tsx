'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { HeartFilledIcon, HeartIcon } from '@/components/icons';
import { useTransientError } from '@/hooks/use-transient-error';

export function LikeButton({
  listingId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  listingId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useTransientError();

  const toggle = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    startTransition(async () => {
      const res = await fetch(`/api/listings/${listingId}/like`, { method: next ? 'POST' : 'DELETE' });
      if (!res.ok) {
        setLiked(!next);
        setCount((c) => c - (next ? 1 : -1));
        setError("Couldn't update. Try again.");
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={liked}
        className={clsx(
          'flex items-center gap-1.5 rounded-pill border px-4 py-2.5 text-sm font-semibold transition-colors',
          liked ? 'border-accent bg-accent/10 text-accent-text' : 'border-border text-ink hover:border-ink',
        )}
      >
        {liked ? <HeartFilledIcon width={18} height={18} /> : <HeartIcon width={18} height={18} />}
        {count > 0 ? count : 'Like'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
