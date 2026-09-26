import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { reportListing, reportUser } from './service';
import { createReportSchema } from './schemas';
import { db } from '@/lib/db';

describe('reports service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    for (const id of cleanupIds) {
      await cleanupTestUser(id);
    }
  });

  it('rejects a seller reporting their own listing', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);
    const listing = await createTestListing(seller.id);

    await expect(reportListing(seller.id, listing.id, { reason: 'SPAM' })).rejects.toMatchObject({
      code: 'CANNOT_REPORT_OWN_LISTING',
    });
  });

  it('rejects a user reporting themselves', async () => {
    const user = await createTestUser();
    cleanupIds.push(user.id);

    await expect(reportUser(user.id, user.id, { reason: 'SPAM' })).rejects.toMatchObject({
      code: 'CANNOT_REPORT_SELF',
    });
  });

  it('rejects reporting a listing that does not exist', async () => {
    const reporter = await createTestUser();
    cleanupIds.push(reporter.id);

    await expect(reportListing(reporter.id, 'nonexistent-listing', { reason: 'SPAM' })).rejects.toMatchObject({
      code: 'LISTING_NOT_FOUND',
    });
  });

  it('rejects reporting a user that does not exist', async () => {
    const reporter = await createTestUser();
    cleanupIds.push(reporter.id);

    await expect(reportUser(reporter.id, 'nonexistent-user', { reason: 'SPAM' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('creates a report with the given reason and details', async () => {
    const seller = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(seller.id, reporter.id);
    const listing = await createTestListing(seller.id);

    const report = await reportListing(reporter.id, listing.id, { reason: 'COUNTERFEIT', details: 'Fake logo' });

    expect(report.reason).toBe('COUNTERFEIT');
    expect(report.details).toBe('Fake logo');
    expect(report.reporterId).toBe(reporter.id);
    expect(report.status).toBe('OPEN');
  });

  it('handles a duplicate open report safely (no duplicate row)', async () => {
    const seller = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(seller.id, reporter.id);
    const listing = await createTestListing(seller.id);

    const first = await reportListing(reporter.id, listing.id, { reason: 'SPAM' });
    const second = await reportListing(reporter.id, listing.id, { reason: 'SCAM' });

    expect(second.id).toBe(first.id);
    const count = await db.report.count({ where: { reporterId: reporter.id, listingId: listing.id } });
    expect(count).toBe(1);
  });

  it('handles a duplicate open user report safely (no duplicate row)', async () => {
    const target = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(target.id, reporter.id);

    const first = await reportUser(reporter.id, target.id, { reason: 'SPAM' });
    const second = await reportUser(reporter.id, target.id, { reason: 'SCAM' });

    expect(second.id).toBe(first.id);
    const count = await db.report.count({ where: { reporterId: reporter.id, targetUserId: target.id } });
    expect(count).toBe(1);
  });

  it('strips a client-supplied reporterId — the schema only accepts reason/details', () => {
    const parsed = createReportSchema.parse({
      reason: 'SPAM',
      details: 'note',
      reporterId: 'attacker-controlled',
      targetUserId: 'attacker-controlled',
    } as never);
    expect(parsed).toEqual({ reason: 'SPAM', details: 'note' });
  });
});
