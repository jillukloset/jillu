import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { likeListing, unlikeListing } from './like-service';
import { saveListing, unsaveListing } from './save-service';
import { db } from '@/lib/db';

describe('like-service / save-service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('prevents duplicate likes on the same listing', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await likeListing(buyer.id, listing.id);
    await likeListing(buyer.id, listing.id); // idempotent, should not throw or duplicate

    const count = await db.like.count({ where: { userId: buyer.id, listingId: listing.id } });
    expect(count).toBe(1);
  });

  it('unlike is idempotent and removes the like', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await likeListing(buyer.id, listing.id);
    await unlikeListing(buyer.id, listing.id);
    await unlikeListing(buyer.id, listing.id);

    const count = await db.like.count({ where: { userId: buyer.id, listingId: listing.id } });
    expect(count).toBe(0);
  });

  it('prevents duplicate saves on the same listing', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await saveListing(buyer.id, listing.id);
    await saveListing(buyer.id, listing.id);

    const count = await db.save.count({ where: { userId: buyer.id, listingId: listing.id } });
    expect(count).toBe(1);
  });

  it('unsave is idempotent and removes the save', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await saveListing(buyer.id, listing.id);
    await unsaveListing(buyer.id, listing.id);
    await unsaveListing(buyer.id, listing.id);

    const count = await db.save.count({ where: { userId: buyer.id, listingId: listing.id } });
    expect(count).toBe(0);
  });

  it('rejects liking a listing that does not exist', async () => {
    const buyer = await createTestUser();
    cleanupIds.push(buyer.id);

    await expect(likeListing(buyer.id, 'nonexistent-listing-id')).rejects.toMatchObject({
      code: 'LISTING_NOT_FOUND',
    });
  });
});
