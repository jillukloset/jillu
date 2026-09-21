import { AppError } from '@/lib/api-result';
import { deleteObject, ensureOwnedObjectKey, verifyUploadedObject } from '@/modules/media/service';
import { MAX_AVATAR_BYTES } from '@/lib/media-config';
import {
  findProfileByUsername,
  getClosetStats,
  isFollowing,
  setAvatar,
  updateProfile,
} from './repository';
import { db } from '@/lib/db';
import type { UpdateProfileInput } from './schemas';

export async function getCloset(username: string, viewerUserId?: string) {
  const profile = await findProfileByUsername(username);
  if (!profile) {
    throw new AppError('CLOSET_NOT_FOUND', 'That closet does not exist.', 404);
  }

  const [stats, viewerFollows] = await Promise.all([
    getClosetStats(profile.userId),
    viewerUserId && viewerUserId !== profile.userId
      ? isFollowing(viewerUserId, profile.userId)
      : Promise.resolve(false),
  ]);

  return {
    profile,
    stats,
    isOwner: viewerUserId === profile.userId,
    isFollowing: viewerFollows,
  };
}

export function updateOwnProfile(userId: string, input: UpdateProfileInput) {
  return updateProfile(userId, {
    displayName: input.displayName,
    bio: input.bio || null,
    location: input.location || null,
  });
}

export async function confirmAvatarUpload(userId: string, objectKey: string, publicUrl: string) {
  ensureOwnedObjectKey(objectKey, userId, 'avatars');
  await verifyUploadedObject(objectKey, MAX_AVATAR_BYTES);

  const existing = await db.profile.findUnique({ where: { userId }, select: { avatarKey: true } });
  const updated = await setAvatar(userId, publicUrl, objectKey);

  if (existing?.avatarKey && existing.avatarKey !== objectKey) {
    await deleteObject(existing.avatarKey).catch(() => undefined);
  }

  return updated;
}
