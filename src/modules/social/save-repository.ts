import { db } from '@/lib/db';

export function createSave(userId: string, listingId: string) {
  return db.save.create({ data: { userId, listingId } });
}

export function deleteSave(userId: string, listingId: string) {
  return db.save.deleteMany({ where: { userId, listingId } });
}

export function findSave(userId: string, listingId: string) {
  return db.save.findUnique({ where: { userId_listingId: { userId, listingId } } });
}

export function countSaves(listingId: string) {
  return db.save.count({ where: { listingId } });
}

export function listSavedListings(userId: string, cursor?: string, take = 24) {
  return db.save.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { listingId: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { userId_listingId: { userId, listingId: cursor } }, skip: 1 } : {}),
    include: { listing: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } } },
  });
}
