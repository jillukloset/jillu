import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getNotificationsPage } from '@/modules/notifications/service';
import { toDisplayNotification } from '@/modules/notifications/mappers';
import { NotificationItem } from '@/components/notifications/notification-item';
import { MarkAllReadButton } from '@/components/notifications/mark-all-read-button';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Notifications — Jillu Kloset' };

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/notifications');

  const { cursor } = await searchParams;
  const { items, hasMore } = await getNotificationsPage(session.user.id, cursor);
  const rows = items.map(toDisplayNotification);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between px-gutter pb-2 pt-8">
        <h1 className="font-display text-3xl">Notifications</h1>
        {rows.length > 0 ? <MarkAllReadButton /> : null}
      </div>

      {rows.length === 0 ? (
        <div className="px-gutter py-6">
          <EmptyState
            title="No notifications yet"
            description="Likes, saves, follows and messages will show up here."
            actionLabel="Explore"
            actionHref="/explore"
          />
        </div>
      ) : (
        <div>
          {rows.map((row) => (
            <NotificationItem key={row.id} {...row} />
          ))}
        </div>
      )}

      {hasMore && rows.at(-1) ? (
        <div className="px-gutter py-6 text-center">
          <Link href={`/notifications?cursor=${rows.at(-1)!.id}`} className="text-sm font-semibold text-ink underline">
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
