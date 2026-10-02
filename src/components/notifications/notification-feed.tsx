'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { NotificationFilters, filterKeyForType, type NotificationFilterKey } from './notification-filters';
import { NotificationItem } from './notification-item';
import type { NotificationWithMedia } from '@/modules/notifications/presenter';

function emptyCopy(filter: NotificationFilterKey): string {
  switch (filter) {
    case 'messages':
      return 'No message notifications in this batch yet.';
    case 'likes':
      return 'No likes yet — your closet is about to be someone’s find.';
    case 'saves':
      return 'No saves yet. The right eyes will find your pieces.';
    case 'follows':
      return 'No new followers yet. Keep sharing your closet.';
    case 'sales':
      return 'No sales activity yet.';
    default:
      return 'Nothing here yet.';
  }
}

/**
 * Client-side filter over the server-loaded notification rows. Filtering stays
 * in the browser so the server pagination contract (cursor link, page size) is
 * untouched; counts reflect the loaded page.
 */
export function NotificationFeed({
  items,
  hasMore,
  nextCursor,
  showLoadMore,
}: {
  items: NotificationWithMedia[];
  hasMore: boolean;
  nextCursor: string | null;
  showLoadMore: boolean;
}) {
  const [active, setActive] = useState<NotificationFilterKey>('all');

  const counts = useMemo(() => {
    const base: Record<NotificationFilterKey, number> = {
      all: items.length,
      messages: 0,
      likes: 0,
      saves: 0,
      follows: 0,
      sales: 0,
    };
    for (const item of items) {
      const key = filterKeyForType(item.type);
      if (key !== 'all') base[key] += 1;
    }
    return base;
  }, [items]);

  const visible = active === 'all' ? items : items.filter((item) => filterKeyForType(item.type) === active);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="lg:sticky lg:top-24 lg:w-48 lg:shrink-0">
        <NotificationFilters counts={counts} active={active} onChange={setActive} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface/60 px-4 py-10 text-center">
            <p className="font-hand text-2xl text-plum">nothing here… yet</p>
            <p className="mt-1 text-sm text-muted">{emptyCopy(active)}</p>
            {active !== 'all' ? (
              <button
                type="button"
                onClick={() => setActive('all')}
                className="mt-3 text-xs font-semibold text-ink underline underline-offset-2"
              >
                Back to all
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {visible.map((item) => (
              <li key={item.id}>
                <NotificationItem {...item} />
              </li>
            ))}
          </ul>
        )}

        {showLoadMore && hasMore && nextCursor ? (
          <div className="pt-2 text-center">
            <Link
              href={`/notifications?cursor=${nextCursor}`}
              className="inline-flex items-center gap-1.5 rounded-pill border border-ink bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-card transition-all duration-fast hover:-translate-y-px hover:shadow-raised"
            >
              Load more
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
