'use client';

import clsx from 'clsx';
import { BellIcon, HeartIcon, MessageIcon, SavedBagIcon, TagIcon, UserIcon } from '@/components/icons';

export type NotificationFilterKey = 'all' | 'messages' | 'likes' | 'saves' | 'follows' | 'sales';

export const NOTIFICATION_FILTERS: { key: NotificationFilterKey; label: string; icon: typeof BellIcon }[] = [
  { key: 'all', label: 'All', icon: BellIcon },
  { key: 'messages', label: 'Messages', icon: MessageIcon },
  { key: 'likes', label: 'Likes', icon: HeartIcon },
  { key: 'saves', label: 'Saves', icon: SavedBagIcon },
  { key: 'follows', label: 'Follows', icon: UserIcon },
  { key: 'sales', label: 'Sales', icon: TagIcon },
];

export function filterKeyForType(type: string): NotificationFilterKey {
  switch (type) {
    case 'NEW_MESSAGE':
      return 'messages';
    case 'LISTING_LIKED':
      return 'likes';
    case 'LISTING_SAVED':
      return 'saves';
    case 'NEW_FOLLOWER':
      return 'follows';
    case 'LISTING_MARKED_SOLD':
      return 'sales';
    default:
      return 'all';
  }
}

/**
 * Filter tabs for the notification feed. Vertical list on desktop, horizontal
 * scroll chips on mobile. Counts reflect the loaded page.
 */
export function NotificationFilters({
  counts,
  active,
  onChange,
}: {
  counts: Record<NotificationFilterKey, number>;
  active: NotificationFilterKey;
  onChange: (key: NotificationFilterKey) => void;
}) {
  return (
    <nav aria-label="Filter notifications" className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:gap-1 lg:overflow-visible">
      {NOTIFICATION_FILTERS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isActive}
            className={clsx(
              'flex shrink-0 items-center gap-2.5 rounded-pill px-4 py-2 text-sm font-semibold transition-colors lg:rounded-md',
              isActive ? 'bg-plum text-paper' : 'text-ink hover:bg-surface',
            )}
          >
            <Icon width={16} height={16} className={clsx(isActive ? 'text-paper' : 'text-muted')} />
            <span className="whitespace-nowrap">{label}</span>
            <span
              className={clsx(
                'ml-auto rounded-pill px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                isActive ? 'bg-paper/20 text-paper' : 'bg-accent/10 text-accent-text',
              )}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
