import { db } from '@/lib/db';

export function createLike(userId: string, listingId: string) {
  return db.like.create({ data: { userId, listingId } });
}

export function deleteLike(userId: string, listingId: string) {
  return db.like.deleteMany({ where: { userId, listingId } });
}

export function findLike(userId: string, listingId: string) {
  return db.like.findUnique({ where: { userId_listingId: { userId, listingId } } });
}

export function countLikes(listingId: string) {
  return db.like.count({ where: { listingId } });
}

export function listLikedListings(userId: string, cursor?: string, take = 24) {
  return db.like.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { listingId: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { userId_listingId: { userId, listingId: cursor } }, skip: 1 } : {}),
    include: { listing: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } } },
  });
}
