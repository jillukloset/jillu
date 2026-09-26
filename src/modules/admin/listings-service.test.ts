import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';
import { adminRemoveListing, adminRestoreListing } from './listings-service';

async function makeAdmin() {
  const admin = await createTestUser();
  await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
  return admin;
}

describe('admin listings service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    for (const id of cleanupIds) {
      await cleanupTestUser(id);
    }
  });

  it('removes (archives) any listing regardless of ownership, with an audit log entry', async () => {
    const admin = await makeAdmin();
    const seller = await createTestUser();
    cleanupIds.push(admin.id, seller.id);
    const listing = await createTestListing(seller.id, { status: 'ACTIVE' });

    const updated = await adminRemoveListing(admin.id, listing.id, 'counterfeit');
    expect(updated.status).toBe('ARCHIVED');

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'LISTING_REMOVED', targetId: listing.id } });
    expect(log).not.toBeNull();
    expect((log!.metadata as { reason: string }).reason).toBe('counterfeit');
  });

  it('restores an archived listing, with an audit log entry', async () => {
    const admin = await makeAdmin();
    const seller = await createTestUser();
    cleanupIds.push(admin.id, seller.id);
    const listing = await createTestListing(seller.id, { status: 'ARCHIVED' });

    const updated = await adminRestoreListing(admin.id, listing.id);
    expect(updated.status).toBe('ACTIVE');

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'LISTING_RESTORED', targetId: listing.id } });
    expect(log).not.toBeNull();
  });

  it('rejects removing a listing that does not exist', async () => {
    const admin = await makeAdmin();
    cleanupIds.push(admin.id);

    await expect(adminRemoveListing(admin.id, 'does-not-exist')).rejects.toMatchObject({ code: 'LISTING_NOT_FOUND' });
  });
});
