import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import {
  getConversationDetail,
  getConversationMessages,
  listMyConversations,
  sendMessage,
  startOrGetConversation,
} from './service';
import { blockUser } from '@/modules/social/block-service';
import { startConversationSchema } from './schemas';

describe('messaging service', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
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
});
