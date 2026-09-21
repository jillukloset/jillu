import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { createSave, deleteSave, findSave } from './save-repository';

export async function saveListing(userId: string, listingId: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true, sellerId: true, title: true } });
  if (!listing) throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);

  const existing = await findSave(userId, listingId);
  if (existing) return existing;

  const save = await createSave(userId, listingId);

  if (listing.sellerId !== userId) {
    const actor = await db.profile.findUnique({ where: { userId }, select: { username: true } });
    await db.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'LISTING_SAVED',
        payload: {
          listingId: listing.id,
          listingTitle: listing.title,
          savedBy: userId,
          savedByUsername: actor?.username ?? null,
        },
      },
    });
  }

  return save;
}

export async function unsaveListing(userId: string, listingId: string) {
  await deleteSave(userId, listingId);
}
