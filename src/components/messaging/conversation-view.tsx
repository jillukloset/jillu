'use client';

import { useCallback, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/icons';
import { Price } from '@/components/ui/price';
import { ReportDialog } from '@/components/reports/report-dialog';
import { MessageThread, type ThreadMessage } from './message-thread';
import { MessageComposer } from './message-composer';

const POLL_INTERVAL_MS = 4000;

type OtherUser = { id: string; username: string; displayName: string; avatarUrl: string | null };
type ListingSummary = { id: string; title: string; price: number; currency: string; primaryImageUrl: string | null };

export function ConversationView({
  conversationId,
  viewerId,
  otherUser,
  listing,
  initialMessages,
  canMessage,
  iBlockedThem,
}: {
  conversationId: string;
  viewerId: string;
  otherUser: OtherUser;
  listing: ListingSummary;
  initialMessages: ThreadMessage[];
  canMessage: boolean;
  iBlockedThem: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [blocked, setBlocked] = useState(iBlockedThem);
  const [messagingAllowed, setMessagingAllowed] = useState(canMessage);
  const [blockPending, setBlockPending] = useState(false);
  const lastIdRef = useRef(initialMessages.at(-1)?.id);

  useQuery({
    queryKey: ['conversation-poll', conversationId],
    queryFn: async () => {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?since=${lastIdRef.current ?? ''}`,
      );
      if (!res.ok) return null;
      const json = await res.json();
      const items: ThreadMessage[] = json.data?.items ?? [];
      if (items.length > 0) {
        lastIdRef.current = items.at(-1)!.id;
        setMessages((prev) => [...prev, ...items]);
      }
      return items;
    },
    refetchInterval: POLL_INTERVAL_MS,
  });

  const sendMessage = useCallback(
    async (body: string) => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) return false;
      const json = await res.json();
      const message: ThreadMessage = json.data;
      lastIdRef.current = message.id;
      setMessages((prev) => [...prev, message]);
      return true;
    },
    [conversationId],
  );

  const toggleBlock = async () => {
    setBlockPending(true);
    const res = await fetch(`/api/users/${otherUser.id}/block`, { method: blocked ? 'DELETE' : 'POST' });
    setBlockPending(false);
    if (!res.ok) return;
    const next = !blocked;
    setBlocked(next);
    setMessagingAllowed(!next);
    router.refresh();
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24 md:pb-6">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-paper px-gutter py-3">
        <div className="flex items-center gap-3">
          <Link href="/messages" aria-label="Back to messages" className="-m-3 p-3 text-ink">
            <ArrowLeftIcon width={20} height={20} />
          </Link>
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-plum">
            {otherUser.avatarUrl ? (
              <Image src={otherUser.avatarUrl} alt={otherUser.displayName} fill sizes="36px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-paper">
                {otherUser.displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <Link href={`/closet/${otherUser.username}`} className="text-sm font-semibold text-ink">
            @{otherUser.username}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ReportDialog targetType="USER" targetId={otherUser.id} triggerLabel="Report" isLoggedIn />
          <button
            type="button"
            onClick={toggleBlock}
            disabled={blockPending}
            className="text-xs font-semibold text-muted underline hover:text-danger"
          >
            {blocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </header>

      <Link
        href={`/listing/${listing.id}`}
        className="flex items-center gap-3 border-b border-border bg-surface px-gutter py-3"
      >
        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-paper">
          {listing.primaryImageUrl ? (
            <Image src={listing.primaryImageUrl} alt={listing.title} fill sizes="40px" className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{listing.title}</p>
          <Price amount={listing.price} currency={listing.currency} className="text-xs text-muted" />
        </div>
        <span className="shrink-0 text-xs font-semibold text-ink underline">View listing</span>
      </Link>

      <MessageThread messages={messages} viewerId={viewerId} />

      <MessageComposer
        disabled={!messagingAllowed}
        disabledReason={
          blocked
            ? "You've blocked this user. Unblock them to keep messaging."
            : 'Messaging is unavailable in this conversation.'
        }
        onSend={sendMessage}
      />
    </div>
  );
}
