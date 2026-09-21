import { db } from '@/lib/db';

export function findProfileByUsername(username: string) {
  return db.profile.findUnique({
    where: { username },
    include: { user: { select: { id: true, status: true, createdAt: true } } },
  });
}

export async function getClosetStats(userId: string) {
  const [followers, following, activeListings, soldListings] = await Promise.all([
    db.follow.count({ where: { followingId: userId } }),
    db.follow.count({ where: { followerId: userId } }),
    db.listing.count({ where: { sellerId: userId, status: 'ACTIVE' } }),
    db.listing.count({ where: { sellerId: userId, status: 'SOLD' } }),
  ]);
  return { followers, following, activeListings, soldListings };
}

export function getActiveListingsForSeller(userId: string, cursor?: string, take = 24) {
  return db.listing.findMany({
    where: { sellerId: userId, status: 'ACTIVE' },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });
}

export function updateProfile(
  userId: string,
  data: { displayName?: string; bio?: string | null; location?: string | null },
) {
  return db.profile.update({ where: { userId }, data });
}

export function setAvatar(userId: string, avatarUrl: string, avatarKey: string) {
  return db.profile.update({ where: { userId }, data: { avatarUrl, avatarKey } });
}

export function isFollowing(followerId: string, followingId: string) {
  return db.follow
    .findUnique({ where: { followerId_followingId: { followerId, followingId } } })
    .then(Boolean);
}
