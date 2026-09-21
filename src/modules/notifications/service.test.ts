import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';
import { likeListing } from '@/modules/social/like-service';
import { followUser } from '@/modules/social/follow-service';
import { startOrGetConversation, sendMessage } from '@/modules/messaging/service';
import { getNotificationsPage, getUnreadCount, markAllRead, markRead } from './service';
import { listNotifications } from './repository';

describe('notifications service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('creates exactly one notification when a listing is liked', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await likeListing(buyer.id, listing.id);

    const count = await db.notification.count({ where: { userId: seller.id, type: 'LISTING_LIKED' } });
    expect(count).toBe(1);
  });

  it('does not spam notifications when the same listing is liked repeatedly', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await likeListing(buyer.id, listing.id);
    await likeListing(buyer.id, listing.id);
    await likeListing(buyer.id, listing.id);

    const count = await db.notification.count({ where: { userId: seller.id, type: 'LISTING_LIKED' } });
    expect(count).toBe(1);
  });

  it('creates exactly one notification when a user is followed', async () => {
    const a = await createTestUser();
    const b = await createTestUser();
    cleanupIds.push(a.id, b.id);

    await followUser(a.id, b.id);

    const count = await db.notification.count({ where: { userId: b.id, type: 'NEW_FOLLOWER' } });
    expect(count).toBe(1);
  });

  it('collapses multiple unread messages in the same conversation into one notification', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    await sendMessage(conversation.id, buyer.id, 'Hi');
    await sendMessage(conversation.id, buyer.id, 'Still there?');
    await sendMessage(conversation.id, buyer.id, 'Hello?');

    const notifications = await db.notification.findMany({ where: { userId: seller.id, type: 'NEW_MESSAGE' } });
    expect(notifications).toHaveLength(1);
    expect((notifications[0]!.payload as { preview: string }).preview).toBe('Hello?');
  });

  it('creates a fresh message notification once the previous one has been read', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    await sendMessage(conversation.id, buyer.id, 'First message');
    const first = await db.notification.findFirstOrThrow({ where: { userId: seller.id, type: 'NEW_MESSAGE' } });
    await markRead(first.id, seller.id);

    await sendMessage(conversation.id, buyer.id, 'Second message');

    const notifications = await db.notification.findMany({ where: { userId: seller.id, type: 'NEW_MESSAGE' } });
    expect(notifications).toHaveLength(2);
  });

  it('rejects marking another user\'s notification as read', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, buyer.id, stranger.id);
    const listing = await createTestListing(seller.id);
    await likeListing(buyer.id, listing.id);
    const notification = await db.notification.findFirstOrThrow({ where: { userId: seller.id } });

    await expect(markRead(notification.id, stranger.id)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('handles an invalid notification id safely', async () => {
    const user = await createTestUser();
    cleanupIds.push(user.id);

    await expect(markRead('does-not-exist', user.id)).rejects.toMatchObject({ code: 'NOTIFICATION_NOT_FOUND' });
  });

  it('only ever returns the requesting user\'s own notifications', async () => {
    const seller = await createTestUser();
    const buyerA = await createTestUser();
    const buyerB = await createTestUser();
    cleanupIds.push(seller.id, buyerA.id, buyerB.id);
    const listingA = await createTestListing(seller.id);
    const listingB = await createTestListing(buyerB.id);

    await likeListing(buyerA.id, listingA.id); // notifies seller
    await likeListing(seller.id, listingB.id); // notifies buyerB

    const { items } = await getNotificationsPage(seller.id);
    expect(items.every((n) => n.userId === seller.id)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('mark-all-read clears the unread count', async () => {
    const seller = await createTestUser();
    const buyerA = await createTestUser();
    const buyerB = await createTestUser();
    cleanupIds.push(seller.id, buyerA.id, buyerB.id);
    const listing = await createTestListing(seller.id);

    await likeListing(buyerA.id, listing.id);
    await followUser(buyerB.id, seller.id);

    expect(await getUnreadCount(seller.id)).toBeGreaterThanOrEqual(2);

    await markAllRead(seller.id);

    expect(await getUnreadCount(seller.id)).toBe(0);
  });

  it('paginates without overlap between pages', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);

    // Five distinct listing-like events => five distinct notifications for the seller.
    const listings = await Promise.all(Array.from({ length: 5 }).map(() => createTestListing(seller.id)));
    for (const listing of listings) {
      await likeListing(buyer.id, listing.id);
    }

    // Exercise the same take+1/cursor pattern used everywhere else with a small page size.
    const page1 = await listNotifications(seller.id, undefined, 2);
    expect(page1.length).toBe(3); // take+1, to detect hasMore
    const firstPage = page1.slice(0, 2);

    const page2 = await listNotifications(seller.id, firstPage.at(-1)!.id, 2);
    const overlap = firstPage.filter((a) => page2.some((b) => b.id === a.id));
    expect(overlap).toHaveLength(0);
  });

  it('does not duplicate or drop rows across pages when createdAt values tie (regression)', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);

    const listings = await Promise.all(Array.from({ length: 6 }).map(() => createTestListing(seller.id)));
    for (const listing of listings) {
      await likeListing(buyer.id, listing.id);
    }

    // Force every notification to share the exact same timestamp — the real-world condition
    // (bulk writes, coarse clock resolution) that broke single-column `orderBy: createdAt`
    // cursor pagination: Postgres orders ties non-deterministically between queries, so a
    // cursor built from one query's last row could reappear, or a row could vanish, on the
    // next page. The fix adds `id` as a secondary, unique sort key.
    const tiedTimestamp = new Date('2026-01-01T00:00:00.000Z');
    await db.notification.updateMany({ where: { userId: seller.id }, data: { createdAt: tiedTimestamp } });

    const seen = new Set<string>();
    let cursor: string | undefined;
    let totalFetched = 0;
    for (let page = 0; page < 10; page++) {
      const rows = await listNotifications(seller.id, cursor, 2);
      const items = rows.slice(0, 2);
      if (items.length === 0) break;
      for (const row of items) seen.add(row.id);
      totalFetched += items.length;
      cursor = items.at(-1)!.id;
      if (rows.length <= 2) break;
    }

    expect(totalFetched).toBe(6);
    expect(seen.size).toBe(6);
  });
});
