import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { createBlock, deleteBlock, findBlock } from './block-repository';

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    throw new AppError('CANNOT_BLOCK_SELF', 'You cannot block yourself.');
  }

  const target = await db.user.findUnique({ where: { id: blockedId }, select: { id: true } });
  if (!target) throw new AppError('USER_NOT_FOUND', 'That user does not exist.', 404);

  const existing = await findBlock(blockerId, blockedId);
  if (existing) return existing;

  return createBlock(blockerId, blockedId);
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await deleteBlock(blockerId, blockedId);
}
