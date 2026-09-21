import { db } from '@/lib/db';

export function createFollow(followerId: string, followingId: string) {
  return db.follow.create({ data: { followerId, followingId } });
}

export function deleteFollow(followerId: string, followingId: string) {
  return db.follow.deleteMany({ where: { followerId, followingId } });
}

export function findFollow(followerId: string, followingId: string) {
  return db.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
}

export function listFollowers(userId: string, cursor?: string, take = 20) {
  return db.follow.findMany({
    where: { followingId: userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { follower: { include: { profile: true } } },
  });
}

export function listFollowing(userId: string, cursor?: string, take = 20) {
  return db.follow.findMany({
    where: { followerId: userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { following: { include: { profile: true } } },
  });
}
