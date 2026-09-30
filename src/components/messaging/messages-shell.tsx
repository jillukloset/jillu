'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { SearchIcon, XIcon } from '@/components/icons';
import { format, formatDistanceToNowStrict, isThisYear } from 'date-fns';
import { toConversationListItem } from '@/modules/messaging/mappers';

type Row = ReturnType<typeof toConversationListItem>;
type Page = { rows: Row[]; hasMore: boolean; nextCursor: string | null };

const LIST_POLL_MS = 8000;

export function MessagesShell({
  viewerId,
  initialRows,
  initialHasMore,
  initialNextCursor,
  children,
}: {
  viewerId: string;
  initialRows: Row[];
  initialHasMore: boolean;
  initialNextCursor: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const activeId = pathname.startsWith('/messages/') ? pathname.split('/')[2] : null;

  const [query, setQuery] = useState('');
  const [extraRows, setExtraRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: firstPage } = useQuery<Page>({
    queryKey: ['conversations-list'],
    initialData: { rows: initialRows, hasMore: initialHasMore, nextCursor: initialNextCursor },
    queryFn: async () => {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to load chats');
      const json = await res.json();
      const items = (json.data?.items ?? []) as Parameters<typeof toConversationListItem>[0][];
      return {
        rows: items.map((item) => toConversationListItem(item, viewerId)),
        hasMore: Boolean(json.data?.hasMore),
        nextCursor: (json.data?.nextCursor ?? null) as string | null,
      };
    },
    refetchInterval: LIST_POLL_MS,
  });

  // Opening a chat marks it read, so refresh the list (unread dots) whenever the route changes.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['conversations-list'] });
    queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
  }, [pathname, queryClient]);

  const rows = useMemo(() => {
    const seen = new Set(firstPage.rows.map((r) => r.id));
    return [...firstPage.rows, ...extraRows.filter((r) => !seen.has(r.id))];
  }, [firstPage.rows, extraRows]);

  const effectiveHasMore = extraRows.length > 0 ? hasMore : firstPage.hasMore;
  const effectiveCursor = extraRows.length > 0 ? cursor : firstPage.nextCursor;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    if (!q) return rows;
    return rows.filter((r) =>
      [r.otherParticipant?.username, r.otherParticipant?.displayName, r.listing.title, r.lastMessage?.body]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const loadMore = async () => {
    if (!effectiveCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/conversations?cursor=${encodeURIComponent(effectiveCursor)}`);
      if (!res.ok) return;
      const json = await res.json();
      const items = (json.data?.items ?? []) as Parameters<typeof toConversationListItem>[0][];
      setExtraRows((prev) => [...prev, ...items.map((item) => toConversationListItem(item, viewerId))]);
      setHasMore(Boolean(json.data?.hasMore));
      setCursor(json.data?.nextCursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  const inChat = activeId !== null;

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] overflow-hidden md:h-[calc(100dvh-4.4rem)]">
      <aside
        className={clsx(
          'w-full shrink-0 flex-col border-border bg-paper md:flex md:w-[360px] md:border-r',
          inChat ? 'hidden' : 'flex',
        )}
      >
        <div className="px-gutter pb-3 pt-6 md:px-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl">Messages</h1>
          </div>

          <div className={'mt-4 flex items-center gap-2 rounded-pill border border-border bg-surface px-4'}>
            <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or @username"
              aria-label="Search chats"
              className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            {query ? (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-muted">
                <XIcon width={16} height={16} />
              </button>
            ) : null}
          </div>
        </div>

        <p className="px-gutter pb-2 pt-2 font-display text-lg md:px-6">Recent chats</p>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No chats yet</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No chats found for “{query}”</p>
          ) : (
            filtered.map((row) => <ChatRow key={row.id} row={row} active={row.id === activeId} />)
          )}

          {effectiveHasMore && !query ? (
            <div className="py-4 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm font-semibold text-ink underline disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <section className={clsx('min-w-0 flex-1 bg-paper md:block', inChat ? 'block' : 'hidden')}>{children}</section>
    </div>
  );
}

function ChatRow({ row, active }: { row: Row; active: boolean }) {
  const other = row.otherParticipant;
  const name = other?.displayName ?? 'Deleted user';
  const unread = row.unreadCount > 0;

  return (
    <Link
      href={`/messages/${row.id}`}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface',
        active && 'bg-surface',
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-plum">
        {other?.avatarUrl ? (
          <Image src={other.avatarUrl} alt={name} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-paper">
            {name[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx('truncate text-sm text-ink', unread ? 'font-bold' : 'font-semibold')}>{name}</p>
          {row.lastMessage ? (
            <span suppressHydrationWarning className="shrink-0 text-[11px] text-muted">
              {shortTime(row.lastMessage.createdAt)}
            </span>
          ) : null}
        </div>
        <p className={clsx('truncate text-sm', unread ? 'font-semibold text-ink' : 'text-muted')}>
          {row.lastMessage ? `${row.lastMessage.isMine ? 'You: ' : ''}${row.lastMessage.body}` : 'Say hello 👋'}
        </p>
      </div>
      {unread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
    </Link>
  );
}

function shortTime(value: Date | string) {
  const date = new Date(value);
  const days = (Date.now() - date.getTime()) / 86_400_000;
  if (days < 7) {
    return formatDistanceToNowStrict(date)
      .replace(/ seconds?/, 's')
      .replace(/ minutes?/, 'm')
      .replace(/ hours?/, 'h')
      .replace(/ days?/, 'd');
  }
  return format(date, isThisYear(date) ? 'MMM d' : 'MMM d, yyyy');
}
