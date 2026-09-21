import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { formatRelativeTime } from '@/lib/format-time';
import { Price } from '@/components/ui/price';

type Props = {
  id: string;
  otherParticipant: { username: string; displayName: string; avatarUrl: string | null } | null;
  listing: { title: string; price: number; currency: string; primaryImageUrl: string | null };
  lastMessage: { body: string; createdAt: Date | string; isMine: boolean } | null;
  unreadCount: number;
};

export function ConversationListItem({ id, otherParticipant, listing, lastMessage, unreadCount }: Props) {
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={`/messages/${id}`}
      className="flex items-center gap-3 border-b border-border px-gutter py-4 transition-colors hover:bg-surface"
    >
      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
        {listing.primaryImageUrl ? (
          <Image src={listing.primaryImageUrl} alt={listing.title} fill sizes="48px" className="object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx('truncate text-sm', hasUnread ? 'font-bold text-ink' : 'font-semibold text-ink')}>
            {otherParticipant?.displayName ?? 'Deleted user'}
          </p>
          {lastMessage ? (
            <span className="shrink-0 text-[11px] text-muted">{formatRelativeTime(lastMessage.createdAt)}</span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted">
          {listing.title} · <Price amount={listing.price} currency={listing.currency} />
        </p>
        <p className={clsx('truncate text-sm', hasUnread ? 'font-semibold text-ink' : 'text-muted')}>
          {lastMessage ? `${lastMessage.isMine ? 'You: ' : ''}${lastMessage.body}` : 'Say hello 👋'}
        </p>
      </div>

      {hasUnread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
    </Link>
  );
}
