import { describe, it, expect, afterEach } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';
import {
  getConversationDetail,
  getConversationMessages,
  getNewMessagesSince,
  listMyConversations,
  sendMessage,
  startOrGetConversation,
} from './service';
import { blockUser } from '@/modules/social/block-service';
import { startConversationSchema } from './schemas';
import { decodeTimeIdCursor } from './cursors';

describe('messaging service', () => {
  const cleanupIds: string[] = [];

  afterEach(async () => {
    const ids = cleanupIds.splice(0);
    for (const id of ids) {
      await cleanupTestUser(id);
    }
  });

  it('creates a conversation when a buyer messages a seller about their listing', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    const conversation = await startOrGetConversation(buyer.id, listing.id);

    expect(conversation.buyerId).toBe(buyer.id);
    expect(conversation.sellerId).toBe(seller.id);
    expect(conversation.listingId).toBe(listing.id);
  });

  it('does not create a duplicate conversation for the same listing+buyer+seller', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    const first = await startOrGetConversation(buyer.id, listing.id);
    const second = await startOrGetConversation(buyer.id, listing.id);

    expect(second.id).toBe(first.id);
  });

  it('prevents a user from messaging themselves about their own listing', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);
    const listing = await createTestListing(seller.id);

    await expect(startOrGetConversation(seller.id, listing.id)).rejects.toMatchObject({
      code: 'CANNOT_MESSAGE_SELF',
    });
  });

  it('rejects starting a conversation about a listing that does not exist', async () => {
    const buyer = await createTestUser();
    cleanupIds.push(buyer.id);

    await expect(startOrGetConversation(buyer.id, 'nonexistent-listing')).rejects.toMatchObject({
      code: 'LISTING_NOT_FOUND',
    });
  });

  it('ignores a client-supplied buyerId/sellerId — identity always comes from the session', async () => {
    // The schema only accepts listingId; verify unknown fields are stripped and never reach the service.
    const parsed = startConversationSchema.parse({
      listingId: 'abc',
      buyerId: 'attacker-controlled',
      sellerId: 'attacker-controlled',
    } as never);
    expect(parsed).toEqual({ listingId: 'abc' });
    expect((parsed as never as Record<string, unknown>).buyerId).toBeUndefined();
  });

  it('a stranger (not buyer or seller) cannot read a conversation', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, buyer.id, stranger.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    await expect(getConversationDetail(conversation.id, stranger.id)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(getConversationMessages(conversation.id, stranger.id)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('a stranger cannot send a message into someone else\'s conversation (no impersonation)', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, buyer.id, stranger.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    await expect(sendMessage(conversation.id, stranger.id, 'sneaky message')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('the buyer and the seller can both send messages, always attributed to themselves', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    const fromBuyer = await sendMessage(conversation.id, buyer.id, 'Is this still available?');
    const fromSeller = await sendMessage(conversation.id, seller.id, 'Yes!');

    expect(fromBuyer.senderId).toBe(buyer.id);
    expect(fromSeller.senderId).toBe(seller.id);
  });

  it('marks messages from the other participant as read when the recipient loads the conversation', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);
    await sendMessage(conversation.id, buyer.id, 'Hello?');

    const { items } = await getConversationMessages(conversation.id, seller.id);
    expect(items[0]?.readAt).not.toBeNull();
  });

  it('does not mark the sender\'s own messages as read via their own view', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);
    await sendMessage(conversation.id, buyer.id, 'Hello?');

    const { items } = await getConversationMessages(conversation.id, buyer.id);
    expect(items[0]?.readAt).toBeNull();
  });

  it('a blocked user cannot start a conversation with the blocker', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);

    await blockUser(seller.id, buyer.id);

    await expect(startOrGetConversation(buyer.id, listing.id)).rejects.toMatchObject({ code: 'BLOCKED' });
  });

  it('blocking mid-conversation prevents further messages from either side', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);
    await sendMessage(conversation.id, buyer.id, 'Hi there');

    await blockUser(buyer.id, seller.id);

    await expect(sendMessage(conversation.id, seller.id, 'Hello?')).rejects.toMatchObject({ code: 'BLOCKED' });
    await expect(sendMessage(conversation.id, buyer.id, 'Still there?')).rejects.toMatchObject({
      code: 'BLOCKED',
    });
  });

  it('handles an invalid/nonexistent conversation id safely', async () => {
    const user = await createTestUser();
    cleanupIds.push(user.id);

    await expect(getConversationDetail('does-not-exist', user.id)).rejects.toMatchObject({
      code: 'CONVERSATION_NOT_FOUND',
    });
    await expect(getConversationMessages('does-not-exist', user.id)).rejects.toMatchObject({
      code: 'CONVERSATION_NOT_FOUND',
    });
    await expect(sendMessage('does-not-exist', user.id, 'hi')).rejects.toMatchObject({
      code: 'CONVERSATION_NOT_FOUND',
    });
  });

  it('computes correct, independent unread counts per conversation (batched, not N+1)', async () => {
    const seller = await createTestUser();
    const buyerA = await createTestUser();
    const buyerB = await createTestUser();
    cleanupIds.push(seller.id, buyerA.id, buyerB.id);
    const listingA = await createTestListing(seller.id);
    const listingB = await createTestListing(seller.id);

    const convoA = await startOrGetConversation(buyerA.id, listingA.id);
    const convoB = await startOrGetConversation(buyerB.id, listingB.id);

    await sendMessage(convoA.id, buyerA.id, 'one');
    await sendMessage(convoA.id, buyerA.id, 'two');
    await sendMessage(convoA.id, buyerA.id, 'three');
    await sendMessage(convoB.id, buyerB.id, 'only one');

    const { items } = await listMyConversations(seller.id);
    const found = (id: string) => items.find((c) => c.id === id);

    expect(found(convoA.id)?.unreadCount).toBe(3);
    expect(found(convoB.id)?.unreadCount).toBe(1);
  });

  describe('listing lifecycle rules', () => {
    it.each(['DRAFT', 'SOLD', 'ARCHIVED'])(
      'rejects starting a conversation about a %s listing',
      async (status) => {
        const seller = await createTestUser();
        const buyer = await createTestUser();
        cleanupIds.push(seller.id, buyer.id);
        const listing = await createTestListing(seller.id, { status });

        await expect(startOrGetConversation(buyer.id, listing.id)).rejects.toMatchObject({
          code: 'LISTING_NOT_MESSAGEABLE',
        });
      },
    );

    it.each(['ACTIVE', 'RESERVED'])('allows starting a conversation about a %s listing', async (status) => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id, { status });

      const conversation = await startOrGetConversation(buyer.id, listing.id);
      expect(conversation.listingId).toBe(listing.id);
    });

    it('stops further messages once the listing is sold mid-conversation', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);
      await sendMessage(conversation.id, buyer.id, 'Still available?');

      await db.listing.update({ where: { id: listing.id }, data: { status: 'SOLD' } });

      await expect(sendMessage(conversation.id, seller.id, 'Just sold, sorry!')).rejects.toMatchObject({
        code: 'LISTING_NOT_MESSAGEABLE',
      });
    });
  });

  describe('cursor-based message pagination and polling', () => {
    it('rejects an empty since cursor instead of reloading the whole thread', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);

      await expect(getNewMessagesSince(conversation.id, buyer.id, '')).rejects.toMatchObject({
        code: 'INVALID_CURSOR',
      });
    });

    it('handles the first-message race on a previously empty thread', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);

      const empty = await getConversationMessages(conversation.id, buyer.id);
      expect(empty.items).toEqual([]);
      expect(empty.sinceCursor).toBeTruthy();

      const sent = await sendMessage(conversation.id, buyer.id, 'Hello, first message');
      const polled = await getNewMessagesSince(conversation.id, seller.id, empty.sinceCursor);

      expect(polled.items.map((m) => m.id)).toEqual([sent.id]);
    });

    it('returns nothing (not a full reload) when polling again with an unchanged cursor', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);
      await sendMessage(conversation.id, buyer.id, 'one');

      const first = await getConversationMessages(conversation.id, seller.id);
      const pollA = await getNewMessagesSince(conversation.id, seller.id, first.sinceCursor);
      const pollB = await getNewMessagesSince(conversation.id, seller.id, first.sinceCursor);

      expect(pollA.items).toEqual([]);
      expect(pollB.items).toEqual([]);
      expect(pollB.sinceCursor).toBe(first.sinceCursor);
    });

    it('does not miss messages sent concurrently between two polls', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);

      const origin = await getConversationMessages(conversation.id, seller.id);

      const [a, b] = await Promise.all([
        sendMessage(conversation.id, buyer.id, 'concurrent A'),
        sendMessage(conversation.id, buyer.id, 'concurrent B'),
      ]);

      const polled = await getNewMessagesSince(conversation.id, seller.id, origin.sinceCursor);
      const polledIds = new Set(polled.items.map((m) => m.id));

      expect(polledIds.has(a.id)).toBe(true);
      expect(polledIds.has(b.id)).toBe(true);
      expect(polled.items).toHaveLength(2);
    });

    it('breaks ties on identical timestamps using id, both for ordering and for the since cursor', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);
      const sameInstant = new Date('2026-01-01T00:00:00.000Z');

      await db.message.createMany({
        data: [
          { id: 'msg-tie-b', conversationId: conversation.id, senderId: buyer.id, body: 'b', createdAt: sameInstant },
          { id: 'msg-tie-a', conversationId: conversation.id, senderId: buyer.id, body: 'a', createdAt: sameInstant },
        ],
      });

      const page = await getConversationMessages(conversation.id, seller.id);
      expect(page.items.map((m) => m.id)).toEqual(['msg-tie-a', 'msg-tie-b']);

      const cursor = decodeTimeIdCursor(page.sinceCursor);
      expect(cursor).toEqual({ at: sameInstant, id: 'msg-tie-b' });

      // Polling with a cursor pinned to the earlier-id tied message must still return the
      // later-id tied message, not skip it because the timestamps are equal.
      const midCursor = page.items[0]!.createdAt;
      const encoded = Buffer.from(
        JSON.stringify({ at: midCursor.toISOString(), id: 'msg-tie-a' }),
        'utf8',
      ).toString('base64url');
      const polled = await getNewMessagesSince(conversation.id, seller.id, encoded);
      expect(polled.items.map((m) => m.id)).toEqual(['msg-tie-b']);
    });

    it('paginates a long thread by (createdAt, id) without losing or duplicating messages', async () => {
      const seller = await createTestUser();
      const buyer = await createTestUser();
      cleanupIds.push(seller.id, buyer.id);
      const listing = await createTestListing(seller.id);
      const conversation = await startOrGetConversation(buyer.id, listing.id);

      const total = 35;
      for (let i = 0; i < total; i += 1) {
        await sendMessage(conversation.id, i % 2 === 0 ? buyer.id : seller.id, `message ${i}`);
      }

      const firstPage = await getConversationMessages(conversation.id, seller.id);
      expect(firstPage.items).toHaveLength(30);
      expect(firstPage.hasMore).toBe(true);
      expect(firstPage.olderCursor).toBeTruthy();

      const secondPage = await getConversationMessages(conversation.id, seller.id, firstPage.olderCursor!);
      expect(secondPage.items).toHaveLength(5);
      expect(secondPage.hasMore).toBe(false);
      expect(secondPage.olderCursor).toBeNull();

      const allIds = [...secondPage.items, ...firstPage.items].map((m) => m.id);
      expect(new Set(allIds).size).toBe(total);

      const bodies = [...secondPage.items, ...firstPage.items].map((m) => m.body);
      expect(bodies).toEqual(Array.from({ length: total }, (_, i) => `message ${i}`));
    });
  });

  describe('inbox pagination', () => {
    it('never skips or repeats conversations across Load More pages', async () => {
      const user = await createTestUser();
      const sellers = await Promise.all([createTestUser(), createTestUser(), createTestUser()]);
      cleanupIds.push(user.id, ...sellers.map((s) => s.id));

      const conversationIds: string[] = [];
      for (const seller of sellers) {
        const listing = await createTestListing(seller.id);
        const conversation = await startOrGetConversation(user.id, listing.id);
        await sendMessage(conversation.id, user.id, 'hi');
        conversationIds.push(conversation.id);
      }

      const firstPage = await listMyConversations(user.id, undefined, 2);
      expect(firstPage.items).toHaveLength(2);
      expect(firstPage.hasMore).toBe(true);
      expect(firstPage.nextCursor).toBeTruthy();

      const secondPage = await listMyConversations(user.id, firstPage.nextCursor!, 2);
      expect(secondPage.items).toHaveLength(1);
      expect(secondPage.hasMore).toBe(false);
      expect(secondPage.nextCursor).toBeNull();

      const seenIds = [...firstPage.items, ...secondPage.items].map((c) => c.id);
      expect(new Set(seenIds).size).toBe(conversationIds.length);
      expect(seenIds.sort()).toEqual([...conversationIds].sort());
    });
  });
});
