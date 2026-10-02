import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getNotificationsPage } from '@/modules/notifications/service';
import { toDisplayNotification } from '@/modules/notifications/mappers';
import { withNotificationMedia } from '@/modules/notifications/presenter';
import { NotificationFeed } from '@/components/notifications/notification-feed';
import { NotificationEditorialImage } from '@/components/notifications/notification-editorial-image';
import { HeartDoodle, SparkleDoodle } from '@/components/notifications/notification-doodles';
import { MarkAllReadButton } from '@/components/notifications/mark-all-read-button';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/notifications');

  const { cursor } = await searchParams;
  const { items, hasMore } = await getNotificationsPage(session.user.id, cursor);
  const rows = await withNotificationMedia(items.map(toDisplayNotification));
  const nextCursor = rows.at(-1)?.id ?? null;

  return (
    <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-8 overflow-x-hidden px-gutter py-8 lg:grid-cols-[260px_1fr_260px] lg:gap-10 lg:py-12">
      {/* Left editorial column — fixed Jillu scrapbook collage, hidden below lg so mobile stays
          focused on the feed. Pre-composed images: do not crop, split, or re-caption them. */}
      <div className="hidden flex-col gap-6 lg:flex">
        <NotificationEditorialImage slot="left-top" src="/left-top.png" alt="Jillu Kloset — pre-loved, re-loved, always iconic" variant="full" />
        <NotificationEditorialImage slot="left-bottom" src="/left-bottom.png" alt="Jillu Kloset — thrift today, brighter tomorrow" variant="full" />
      </div>

      {/* Center — hero, filters, feed. The only zone mobile keeps. */}
      <div className="min-w-0">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display text-4xl tracking-tight text-ink sm:text-5xl">
              Notifications
              <HeartDoodle width={28} height={28} className="shrink-0 text-accent" />
            </h1>
            <p className="mt-2 text-sm text-muted">Your latest closet activity.</p>
          </div>

          {/* Mirrors the right column's "stay in the loop" prompt on mobile/tablet, where that
              column is hidden. */}
          {rows.length > 0 ? (
            <div className="flex flex-col items-end gap-2 lg:hidden">
              <MarkAllReadButton />
            </div>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Likes, saves, follows and messages will show up here."
            actionLabel="Explore"
            actionHref="/explore"
          />
        ) : (
          <NotificationFeed items={rows} hasMore={hasMore} nextCursor={nextCursor} showLoadMore />
        )}
      </div>

      {/* Right editorial column — "stay in the loop" prompt + mark-all-read, then the second
          fixed collage image. Hidden below lg; its mark-all-read affordance is mirrored above
          for mobile/tablet so the action is never lost. */}
      <div className="hidden flex-col gap-6 lg:flex">
        <div className="flex flex-col items-end gap-3 text-right">
          <p className="flex items-center gap-1.5 font-hand text-2xl leading-none text-plum">
            Stay in the loop
            <HeartDoodle width={18} height={18} className="text-accent" />
          </p>
          {rows.length > 0 ? <MarkAllReadButton /> : null}
        </div>
        <NotificationEditorialImage slot="right-editorial" src="/right-editorial.png" alt="Jillu Kloset — good clothes, brighter people" variant="full" />
      </div>

      <SparkleDoodle width={22} height={22} className="pointer-events-none absolute left-[270px] top-6 hidden text-plum/30 lg:block" aria-hidden />
    </div>
  );
}
