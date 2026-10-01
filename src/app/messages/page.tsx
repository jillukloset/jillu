import type { Metadata } from 'next';
import { MessageIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full border border-border text-muted">
        <MessageIcon width={40} height={40} strokeWidth={1.2} />
      </span>
      <p className="font-display text-2xl text-ink">Your messages</p>
      <p className="text-sm text-muted">Select a chat to start messaging.</p>
    </div>
  );
}
