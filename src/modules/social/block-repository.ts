import { db } from '@/lib/db';

export function createBlock(blockerId: string, blockedId: string) {
  return db.block.create({ data: { blockerId, blockedId } });
}

export function deleteBlock(blockerId: string, blockedId: string) {
  return db.block.deleteMany({ where: { blockerId, blockedId } });
}

export function findBlock(blockerId: string, blockedId: string) {
  return db.block.findUnique({ where: { blockerId_blockedId: { blockerId, blockedId } } });
}

export async function isBlockedEitherWay(userIdA: string, userIdB: string) {
  const count = await db.block.count({
    where: {
      OR: [
        { blockerId: userIdA, blockedId: userIdB },
        { blockerId: userIdB, blockedId: userIdA },
      ],
    },
  });
  return count > 0;
}
