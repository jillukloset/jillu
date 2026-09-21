import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';
import { reportListing } from '@/modules/reports/service';
import { dismissReport, resolveReport, reviewReport } from './reports-service';

async function makeAdmin() {
  const admin = await createTestUser();
  await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
  return admin;
}

describe('admin reports service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('moves a report to REVIEWING', async () => {
    const admin = await makeAdmin();
    const seller = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(admin.id, seller.id, reporter.id);
    const listing = await createTestListing(seller.id);
    const report = await reportListing(reporter.id, listing.id, { reason: 'SPAM' });

    const updated = await reviewReport(admin.id, report.id);
    expect(updated.status).toBe('REVIEWING');
  });

  it('resolves a report with an admin note and records an audit log entry', async () => {
    const admin = await makeAdmin();
    const seller = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(admin.id, seller.id, reporter.id);
    const listing = await createTestListing(seller.id);
    const report = await reportListing(reporter.id, listing.id, { reason: 'SCAM' });

    const updated = await resolveReport(admin.id, report.id, 'Removed the listing.');
    expect(updated.status).toBe('RESOLVED');
    expect(updated.adminNote).toBe('Removed the listing.');
    expect(updated.reviewedAt).not.toBeNull();

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'REPORT_RESOLVED', targetId: report.id } });
    expect(log).not.toBeNull();
  });

  it('dismisses a report and records an audit log entry', async () => {
    const admin = await makeAdmin();
    const seller = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(admin.id, seller.id, reporter.id);
    const listing = await createTestListing(seller.id);
    const report = await reportListing(reporter.id, listing.id, { reason: 'OTHER' });

    const updated = await dismissReport(admin.id, report.id);
    expect(updated.status).toBe('DISMISSED');

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'REPORT_DISMISSED', targetId: report.id } });
    expect(log).not.toBeNull();
  });

  it('rejects acting on a report that does not exist', async () => {
    const admin = await makeAdmin();
    cleanupIds.push(admin.id);

    await expect(resolveReport(admin.id, 'does-not-exist')).rejects.toMatchObject({ code: 'REPORT_NOT_FOUND' });
  });
});
