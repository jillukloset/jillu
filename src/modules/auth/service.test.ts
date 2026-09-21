import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { cleanupTestUser } from '@/test-utils/factories';
import { signup, verifyCredentials } from './service';

describe('auth service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('rejects signup with a duplicate email', async () => {
    const stamp = Date.now();
    const user = await signup({
      email: `dup${stamp}@test.jillukloset.com`,
      password: 'TestPassword123',
      username: `dup${stamp}`,
      displayName: 'Dup User',
    });
    cleanupIds.push(user.id);

    await expect(
      signup({
        email: `dup${stamp}@test.jillukloset.com`,
        password: 'TestPassword123',
        username: `dupother${stamp}`,
        displayName: 'Dup User 2',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
  });

  it('rejects signup with a duplicate username', async () => {
    const stamp = Date.now();
    const user = await signup({
      email: `uniq${stamp}@test.jillukloset.com`,
      password: 'TestPassword123',
      username: `sharedname${stamp}`,
      displayName: 'First',
    });
    cleanupIds.push(user.id);

    await expect(
      signup({
        email: `uniq2${stamp}@test.jillukloset.com`,
        password: 'TestPassword123',
        username: `sharedname${stamp}`,
        displayName: 'Second',
      }),
    ).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
  });

  it('rejects login before the email is verified', async () => {
    const stamp = Date.now();
    const user = await signup({
      email: `unverified${stamp}@test.jillukloset.com`,
      password: 'TestPassword123',
      username: `unverified${stamp}`,
      displayName: 'Unverified',
    });
    cleanupIds.push(user.id);

    await expect(verifyCredentials(user.email, 'TestPassword123')).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
    });
  });

  it('returns null for a correct email but wrong password (after verifying email)', async () => {
    const stamp = Date.now();
    const user = await signup({
      email: `wrongpw${stamp}@test.jillukloset.com`,
      password: 'TestPassword123',
      username: `wrongpw${stamp}`,
      displayName: 'Wrong PW',
    });
    cleanupIds.push(user.id);
    await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });

    const result = await verifyCredentials(user.email, 'NotTheRightPassword');
    expect(result).toBeNull();
  });

  it('rejects login for a suspended account', async () => {
    const stamp = Date.now();
    const user = await signup({
      email: `suspended${stamp}@test.jillukloset.com`,
      password: 'TestPassword123',
      username: `suspended${stamp}`,
      displayName: 'Suspended',
    });
    cleanupIds.push(user.id);
    await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date(), status: 'SUSPENDED' } });

    await expect(verifyCredentials(user.email, 'TestPassword123')).rejects.toMatchObject({
      code: 'ACCOUNT_SUSPENDED',
    });
  });
});
