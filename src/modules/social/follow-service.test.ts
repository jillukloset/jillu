import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, cleanupTestUser } from '@/test-utils/factories';
import { followUser, unfollowUser } from './follow-service';
import { db } from '@/lib/db';

describe('follow-service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    for (const id of cleanupIds) {
      await cleanupTestUser(id);
    }
  });

  it('prevents a user from following themselves', async () => {
    const user = await createTestUser();
    cleanupIds.push(user.id);

    await expect(followUser(user.id, user.id)).rejects.toMatchObject({ code: 'CANNOT_FOLLOW_SELF' });
  });

  it('prevents duplicate follow relationships', async () => {
    const a = await createTestUser();
    const b = await createTestUser();
    cleanupIds.push(a.id, b.id);

    await followUser(a.id, b.id);
    await followUser(a.id, b.id); // should not throw, should not duplicate

    const count = await db.follow.count({ where: { followerId: a.id, followingId: b.id } });
    expect(count).toBe(1);
  });

  it('unfollow removes the relationship and is idempotent', async () => {
    const a = await createTestUser();
    const b = await createTestUser();
    cleanupIds.push(a.id, b.id);

    await followUser(a.id, b.id);
    await unfollowUser(a.id, b.id);
    await unfollowUser(a.id, b.id); // calling twice should not throw

    const count = await db.follow.count({ where: { followerId: a.id, followingId: b.id } });
    expect(count).toBe(0);
  });
});
