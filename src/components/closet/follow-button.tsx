'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useTransientError } from '@/hooks/use-transient-error';

export function FollowButton({
  targetUserId,
  initialFollowing,
  isLoggedIn,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useTransientError();

  const toggle = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const res = await fetch(`/api/users/${targetUserId}/follow`, { method: next ? 'POST' : 'DELETE' });
      if (!res.ok) {
        setFollowing(!next);
        setError("Couldn't update follow status. Try again.");
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
        className={clsx(
          'rounded-pill px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60',
          following
            ? 'border border-ink bg-transparent text-ink hover:bg-danger/10 hover:text-danger hover:border-danger'
            : 'bg-ink text-paper hover:bg-accent',
        )}
      >
        {following ? 'Following' : 'Follow'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
