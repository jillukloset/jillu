import { db } from '@/lib/db';
import type { DisplayNotification } from './mappers';

export type NotificationWithMedia = DisplayNotification & {
  avatarUrl: string | null;
  listingImageUrl: string | null;
};

/**
 * Presentation-only enrichment: resolves the actor avatars and listing cover
 * images for a page of already-fetched notifications. Read-only — does not
 * change what notifications exist or how they are created/marked read.
 */
export async function withNotificationMedia(rows: DisplayNotification[]): Promise<NotificationWithMedia[]> {
  const actorIds = [...new Set(rows.map((r) => r.actorId).filter((id): id is string => Boolean(id)))];
  const listingIds = [...new Set(rows.map((r) => r.listingId).filter((id): id is string => Boolean(id)))];

  const [profiles, listings] = await Promise.all([
    actorIds.length
      ? db.profile.findMany({ where: { userId: { in: actorIds } }, select: { userId: true, avatarUrl: true } })
      : Promise.resolve([] as { userId: string; avatarUrl: string | null }[]),
    listingIds.length
      ? db.listing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } } },
        })
      : Promise.resolve([] as { id: string; images: { url: string }[] }[]),
  ]);

  const avatarByUserId = new Map(profiles.map((p) => [p.userId, p.avatarUrl]));
  const imageByListingId = new Map(listings.map((l) => [l.id, l.images[0]?.url ?? null]));

  return rows.map((row) => ({
    ...row,
    avatarUrl: row.actorId ? avatarByUserId.get(row.actorId) ?? null : null,
    listingImageUrl: row.listingId ? imageByListingId.get(row.listingId) ?? null : null,
  }));
}
