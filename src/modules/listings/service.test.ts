import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { changeListingStatus, removeListing, updateExistingListing } from './service';

describe('listings ownership', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('rejects a non-owner trying to update a listing', async () => {
    const seller = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, stranger.id);

    const listing = await createTestListing(seller.id);

    await expect(
      updateExistingListing(listing.id, stranger.id, { title: 'Hijacked title' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects a non-owner trying to change listing status', async () => {
    const seller = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, stranger.id);

    const listing = await createTestListing(seller.id);

    await expect(changeListingStatus(listing.id, stranger.id, 'SOLD')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('rejects a non-owner trying to delete a listing', async () => {
    const seller = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, stranger.id);

    const listing = await createTestListing(seller.id, { status: 'DRAFT' });

    await expect(removeListing(listing.id, stranger.id)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('allows the owner to update their own listing', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);

    const listing = await createTestListing(seller.id);
    const updated = await updateExistingListing(listing.id, seller.id, { title: 'My updated title' });

    expect(updated.title).toBe('My updated title');
  });

  it('rejects an invalid status transition (SOLD -> ACTIVE)', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);

    const listing = await createTestListing(seller.id, { status: 'SOLD' });

    await expect(changeListingStatus(listing.id, seller.id, 'ACTIVE')).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });
  });

  it('refuses to delete a published (non-draft) listing', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);

    const listing = await createTestListing(seller.id, { status: 'ACTIVE' });

    await expect(removeListing(listing.id, seller.id)).rejects.toMatchObject({
      code: 'CANNOT_DELETE_PUBLISHED',
    });
  });
});
