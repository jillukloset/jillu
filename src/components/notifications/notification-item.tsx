'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { formatRelativeTime } from '@/lib/format-time';

export function NotificationItem({
  id,
  message,
  href,
  readAt,
  createdAt,
}: {
  id: string;
  message: string;
  href: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
}) {
  const isUnread = !readAt;

  const markRead = () => {
    if (!isUnread) return;
    // Fire-and-forget: don't block navigation on this.
    fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => undefined);
  };

  const content = (
    <>
      <p className={clsx('text-sm', isUnread ? 'font-semibold text-ink' : 'text-muted')}>{message}</p>
      <span suppressHydrationWarning className="text-xs text-muted">
        {formatRelativeTime(createdAt)}
      </span>
    </>
  );

  const rowClass = 'flex items-start justify-between gap-3 border-b border-border px-gutter py-4 transition-colors hover:bg-surface';

  if (!href) {
    return (
      <div className={rowClass}>
        <div className="flex-1">{content}</div>
        {isUnread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
      </div>
    );
  }

  return (
    <Link href={href} onClick={markRead} className={rowClass}>
      <div className="flex-1">{content}</div>
      {isUnread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
    </Link>
  );
}
