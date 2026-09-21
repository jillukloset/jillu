import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { createFollow, deleteFollow, findFollow } from './follow-repository';

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError('CANNOT_FOLLOW_SELF', 'You cannot follow your own closet.');
  }

  const target = await db.user.findUnique({ where: { id: followingId }, select: { id: true } });
  if (!target) {
    throw new AppError('USER_NOT_FOUND', 'That closet does not exist.', 404);
  }

  const existing = await findFollow(followerId, followingId);
  if (existing) return existing;

  const follow = await createFollow(followerId, followingId);

  const follower = await db.profile.findUnique({ where: { userId: followerId } });
  await db.notification.create({
    data: {
      userId: followingId,
      type: 'NEW_FOLLOWER',
      payload: { followerId, followerUsername: follower?.username ?? null },
    },
  });

  return follow;
}

export async function unfollowUser(followerId: string, followingId: string) {
  await deleteFollow(followerId, followingId);
}
