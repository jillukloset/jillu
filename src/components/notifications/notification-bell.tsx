'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BellIcon } from '@/components/icons';

const POLL_INTERVAL_MS = 20000;

export function NotificationBell({ className }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/unread-count');
      if (!res.ok) return { count: 0 };
      const json = await res.json();
      return json.data as { count: number };
    },
    refetchInterval: POLL_INTERVAL_MS,
  });

  const count = data?.count ?? 0;

  return (
    <Link href="/notifications" aria-label="Notifications" className={`text-ink ${className ?? ''}`}>
      {/* Padding on the Link grows the tap target; this inner wrapper keeps the badge
          anchored to the icon itself instead of the Link's (now larger) padding box. */}
      <span className="relative block">
        <BellIcon />
        {count > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold leading-none text-accent-ink">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
