import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';
import { suspendUser, restoreUser } from './users-service';

async function makeAdmin() {
  const admin = await createTestUser();
  await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
  return admin;
}

describe('admin users service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    for (const id of cleanupIds) {
      await cleanupTestUser(id);
    }
  });

  it('suspends a user and records an audit log entry', async () => {
    const admin = await makeAdmin();
    const target = await createTestUser();
    cleanupIds.push(admin.id, target.id);

    const updated = await suspendUser(admin.id, target.id);
    expect(updated.status).toBe('SUSPENDED');

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'USER_SUSPENDED', targetId: target.id } });
    expect(log).not.toBeNull();
  });

  it('restores a suspended user and records an audit log entry', async () => {
    const admin = await makeAdmin();
    const target = await createTestUser();
    cleanupIds.push(admin.id, target.id);

    await suspendUser(admin.id, target.id);
    const restored = await restoreUser(admin.id, target.id);
    expect(restored.status).toBe('ACTIVE');

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'USER_RESTORED', targetId: target.id } });
    expect(log).not.toBeNull();
  });

  it('prevents an admin from suspending their own account', async () => {
    const admin = await makeAdmin();
    cleanupIds.push(admin.id);

    await expect(suspendUser(admin.id, admin.id)).rejects.toMatchObject({ code: 'CANNOT_SUSPEND_SELF' });
  });

  it('prevents suspending another admin', async () => {
    const admin = await makeAdmin();
    const otherAdmin = await makeAdmin();
    cleanupIds.push(admin.id, otherAdmin.id);

    await expect(suspendUser(admin.id, otherAdmin.id)).rejects.toMatchObject({ code: 'CANNOT_SUSPEND_ADMIN' });
  });

  it('rejects suspending a user that does not exist', async () => {
    const admin = await makeAdmin();
    cleanupIds.push(admin.id);

    await expect(suspendUser(admin.id, 'does-not-exist')).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });
});
