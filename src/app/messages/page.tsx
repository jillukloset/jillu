import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listMyConversations } from '@/modules/messaging/service';
import { toConversationListItem } from '@/modules/messaging/mappers';
import { ConversationListItem } from '@/components/messaging/conversation-list-item';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Messages — Jillu Kloset' };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/messages');

  const { cursor } = await searchParams;
  const { items, hasMore } = await listMyConversations(session.user.id, cursor);
  const rows = items.map((item) => toConversationListItem(item, session.user.id));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="px-gutter pb-2 pt-8 font-display text-3xl">Messages</h1>

      {rows.length === 0 ? (
        <div className="px-gutter py-6">
          <EmptyState
            title="No conversations yet"
            description="Find something you love and start the conversation."
            actionLabel="Explore"
            actionHref="/explore"
          />
        </div>
      ) : (
        <div>
          {rows.map((row) => (
            <ConversationListItem key={row.id} {...row} />
          ))}
        </div>
      )}

      {hasMore && rows.at(-1) ? (
        <div className="px-gutter py-6 text-center">
          <Link href={`/messages?cursor=${rows.at(-1)!.id}`} className="text-sm font-semibold text-ink underline">
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
