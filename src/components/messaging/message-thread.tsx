'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { formatRelativeTime } from '@/lib/format-time';

export type ThreadMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string | Date;
};

export function MessageThread({ messages, viewerId }: { messages: ThreadMessage[]; viewerId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="flex min-h-[40vh] flex-col gap-2 px-gutter py-4">
      {messages.map((message) => {
        const mine = message.senderId === viewerId;
        return (
          <div key={message.id} className={clsx('flex flex-col', mine ? 'items-end' : 'items-start')}>
            <div
              className={clsx(
                'max-w-[75%] rounded-lg px-4 py-2.5 text-sm',
                mine ? 'bg-ink text-paper' : 'bg-surface text-ink',
              )}
            >
              {message.body}
            </div>
            <span suppressHydrationWarning className="mt-1 text-[10px] text-muted">
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
