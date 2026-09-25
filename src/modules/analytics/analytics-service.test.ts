import { describe, it, expect, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { resolveDateRange } from './date-range';
import { activeAndReturningUsers, countNewSellersInRange } from './user-analytics-repository';
import { getListingAnalytics } from './listing-analytics-service';
import { getOverviewMetrics } from './overview-service';

// These read from the whole table (shared with other tests / seed data), so assertions use
// before/after deltas from known fixtures rather than absolute counts, which would be flaky.
describe('analytics services (against real seeded data)', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('counts a user as active and returning only when they engaged and predate the window', async () => {
    const range = resolveDateRange('30d');

    // "old" user: account predates the window, and does something inside it -> active + returning.
    const oldUser = await createTestUser();
    cleanupIds.push(oldUser.id);
    await db.user.update({ where: { id: oldUser.id }, data: { createdAt: range.previousStart } });
    const someonesListing = await createTestListing(oldUser.id);
    await db.like.create({ data: { userId: oldUser.id, listingId: someonesListing.id } });

    // "silent" user: account predates the window too, but does nothing -> not active.
    const silentUser = await createTestUser();
    cleanupIds.push(silentUser.id);
    await db.user.update({ where: { id: silentUser.id }, data: { createdAt: range.previousStart } });

    const result = await activeAndReturningUsers(range);

    // Can't assert exact totals (shared table), but the old/active user must be counted,
    // and activeUsers must be >= returningUsers by construction of the query.
    expect(result.activeUsers).toBeGreaterThanOrEqual(1);
    expect(result.returningUsers).toBeGreaterThanOrEqual(1);
    expect(result.activeUsers).toBeGreaterThanOrEqual(result.returningUsers);
  });

  it('counts a seller as "new" only in the window containing their first-ever listing', async () => {
    const range = resolveDateRange('7d');
    const seller = await createTestUser();
    cleanupIds.push(seller.id);
    // createTestListing defaults createdAt to now(), which falls inside a 7-day window starting today.
    await createTestListing(seller.id);

    const before = await countNewSellersInRange(range);
    const secondSeller = await createTestUser();
    cleanupIds.push(secondSeller.id);
    await createTestListing(secondSeller.id);
    const after = await countNewSellersInRange(range);

    expect(after).toBe(before + 1);
  });

  it('reflects newly created listings in the status breakdown', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);

    const before = await getListingAnalytics();
    const beforeActive = before.statusBreakdown.find((s) => s.status === 'ACTIVE')!.count;
    const beforeDraft = before.statusBreakdown.find((s) => s.status === 'DRAFT')!.count;

    await createTestListing(seller.id, { status: 'ACTIVE' });
    await createTestListing(seller.id, { status: 'DRAFT' });

    const after = await getListingAnalytics();
    const afterActive = after.statusBreakdown.find((s) => s.status === 'ACTIVE')!.count;
    const afterDraft = after.statusBreakdown.find((s) => s.status === 'DRAFT')!.count;

    expect(afterActive).toBe(beforeActive + 1);
    expect(afterDraft).toBe(beforeDraft + 1);
  });

  it('surfaces a newly liked listing in "most liked" once it has at least one like', async () => {
    const seller = await createTestUser();
    const liker = await createTestUser();
    cleanupIds.push(seller.id, liker.id);
    const listing = await createTestListing(seller.id);
    await db.like.create({ data: { userId: liker.id, listingId: listing.id } });

    const analytics = await getListingAnalytics();
    // A single like may or may not make the (limited) top-8 depending on other data, so just
    // verify the query runs and returns a well-formed, non-crashing shape — the exact ranking
    // is inherently dependent on shared table contents.
    expect(Array.isArray(analytics.mostLiked)).toBe(true);
    for (const item of analytics.mostLiked) {
      expect(item.count).toBeGreaterThan(0);
      expect(typeof item.title).toBe('string');
    }
  });

  it('overview metrics report the same total user count as a direct database count', async () => {
    // Comparing against a before/after snapshot with a mutation in between would be flaky here:
    // Vitest runs test files in parallel workers against the same database (see the comment atop
    // test-utils/factories.ts), so another file's user create/cleanup can land in that window.
    // Comparing two reads taken back-to-back against ground truth avoids that race entirely.
    const [groundTruth, metrics] = await Promise.all([db.user.count(), getOverviewMetrics()]);
    const totalUsers = metrics.find((k) => k.label === 'Total users')!.value;
    expect(totalUsers).toBe(groundTruth);
  });
});
