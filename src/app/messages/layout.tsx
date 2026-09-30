import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listMyConversations } from '@/modules/messaging/service';
import { toConversationListItem } from '@/modules/messaging/mappers';
import { MessagesShell } from '@/components/messaging/messages-shell';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/messages');

  const { items, hasMore, nextCursor } = await listMyConversations(session.user.id);
  const rows = items.map((item) => toConversationListItem(item, session.user.id));

  return (
    <MessagesShell
      viewerId={session.user.id}
      initialRows={JSON.parse(JSON.stringify(rows))}
      initialHasMore={hasMore}
      initialNextCursor={nextCursor}
    >
      {children}
    </MessagesShell>
  );
}
