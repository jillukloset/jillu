import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, cleanupTestUser } from '@/test-utils/factories';
import { blockUser, unblockUser } from './block-service';
import { db } from '@/lib/db';

describe('block-service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    for (const id of cleanupIds) {
      await cleanupTestUser(id);
    }
  });

  it('prevents a user from blocking themselves', async () => {
    const user = await createTestUser();
    cleanupIds.push(user.id);

    await expect(blockUser(user.id, user.id)).rejects.toMatchObject({ code: 'CANNOT_BLOCK_SELF' });
  });

  it('is idempotent — blocking twice does not duplicate the row', async () => {
    const a = await createTestUser();
    const b = await createTestUser();
    cleanupIds.push(a.id, b.id);

    await blockUser(a.id, b.id);
    await blockUser(a.id, b.id);

    const count = await db.block.count({ where: { blockerId: a.id, blockedId: b.id } });
    expect(count).toBe(1);
  });

  it('unblock removes the block and is idempotent', async () => {
    const a = await createTestUser();
    const b = await createTestUser();
    cleanupIds.push(a.id, b.id);

    await blockUser(a.id, b.id);
    await unblockUser(a.id, b.id);
    await unblockUser(a.id, b.id);

    const count = await db.block.count({ where: { blockerId: a.id, blockedId: b.id } });
    expect(count).toBe(0);
  });
});
