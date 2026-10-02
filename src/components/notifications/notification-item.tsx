'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { formatRelativeTime } from '@/lib/format-time';
import { BellIcon, ChevronRightIcon, HeartIcon, MessageIcon, SavedBagIcon, TagIcon, UserIcon } from '@/components/icons';
import type { NotificationWithMedia } from '@/modules/notifications/presenter';

function activityIconFor(type: string) {
  switch (type) {
    case 'NEW_MESSAGE':
      return <MessageIcon width={12} height={12} className="text-accent" />;
    case 'NEW_FOLLOWER':
      return <UserIcon width={12} height={12} className="text-plum" />;
    case 'LISTING_LIKED':
      return <HeartIcon width={12} height={12} className="text-accent" />;
    case 'LISTING_SAVED':
      return <SavedBagIcon width={14} height={14} />;
    case 'LISTING_MARKED_SOLD':
      return <TagIcon width={12} height={12} className="text-success" />;
    default:
      return <BellIcon width={12} height={12} className="text-muted" />;
  }
}

/** Split "…message" into a bold actor label + the remaining body, when the actor is known. */
function splitMessage(message: string, actorUsername: string | null): { actor: string | null; rest: string } {
  if (!actorUsername) return { actor: null, rest: message };
  const actor = `@${actorUsername}`;
  if (!message.startsWith(actor)) return { actor: null, rest: message };
  const rest = message.slice(actor.length).replace(/^:\s*/, ' ');
  return { actor, rest };
}

export function NotificationItem({
  id,
  type,
  message,
  href,
  readAt,
  createdAt,
  actorUsername,
  avatarUrl,
  listingImageUrl,
}: NotificationWithMedia) {
  const isUnread = !readAt;
  const queryClient = useQueryClient();

  const markRead = () => {
    if (!isUnread) return;
    queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    // Fire-and-forget: don't block navigation on this.
    fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => undefined);
  };

  const { actor, rest } = splitMessage(message, actorUsername);

  const content = (
    <>
      {/* Avatar + activity badge */}
      <span className="relative h-10 w-10 shrink-0">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-paper">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={40} height={40} className="h-full w-full object-cover" unoptimized />
          ) : (
            <span className="font-display text-lg italic text-plum">{(actorUsername ?? '?').slice(0, 1).toUpperCase()}</span>
          )}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-surface bg-paper">
          {activityIconFor(type)}
        </span>
      </span>

      {/* Message + time */}
      <span className="min-w-0 flex-1">
        <span className={clsx('block text-sm leading-snug', isUnread ? 'text-ink' : 'text-muted')}>
          {actor ? <span className="font-semibold">{actor}</span> : null}
          {actor ? <span className={clsx(isUnread ? 'text-ink' : 'text-muted')}> {rest}</span> : rest}
        </span>
        <span suppressHydrationWarning className="mt-0.5 block text-xs text-muted">
          {formatRelativeTime(createdAt)}
        </span>
      </span>

      {/* Listing thumbnail */}
      {listingImageUrl ? (
        <span className="relative hidden h-14 w-11 shrink-0 overflow-hidden rounded-md border border-border xs:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listingImageUrl} alt="" className="h-full w-full object-cover" />
        </span>
      ) : null}

      {/* Unread + affordance */}
      <span className="flex shrink-0 flex-col items-center gap-1.5 self-center">
        {isUnread ? <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" /> : null}
        <ChevronRightIcon width={14} height={14} className="text-muted/60 transition-colors group-hover:text-ink" />
      </span>
    </>
  );

  const rowClass =
    'group flex items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-card transition-all duration-fast hover:-translate-y-px hover:shadow-raised';

  if (!href) {
    return (
      <div className={rowClass} aria-label={isUnread ? 'Unread notification' : undefined}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} onClick={markRead} className={rowClass} aria-label={isUnread ? 'Unread notification' : undefined}>
      {content}
    </Link>
  );
}
