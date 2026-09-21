import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { createLike, deleteLike, findLike } from './like-repository';

export async function likeListing(userId: string, listingId: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true, sellerId: true, title: true } });
  if (!listing) throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);

  const existing = await findLike(userId, listingId);
  if (existing) return existing;

  const like = await createLike(userId, listingId);

  if (listing.sellerId !== userId) {
    const actor = await db.profile.findUnique({ where: { userId }, select: { username: true } });
    await db.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'LISTING_LIKED',
        payload: {
          listingId: listing.id,
          listingTitle: listing.title,
          likedBy: userId,
          likedByUsername: actor?.username ?? null,
        },
      },
    });
  }

  return like;
}

export async function unlikeListing(userId: string, listingId: string) {
  await deleteLike(userId, listingId);
}
