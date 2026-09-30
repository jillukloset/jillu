import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { isBlockedEitherWay } from '@/modules/social/block-repository';
import { notifyNewMessage } from '@/modules/notifications/service';
import {
  decodeTimeIdCursor,
  encodeMessagePollOrigin,
  encodeTimeIdCursor,
  type TimeIdCursor,
} from './cursors';
import { isListingMessageable } from './messageable';
import {
  CONVERSATIONS_PAGE_SIZE,
  MESSAGES_PAGE_SIZE,
  countAllUnreadMessages,
  countUnreadForConversations,
  createConversation,
  createMessage,
  findConversation,
  findConversationById,
  listConversationsForUser,
  listMessages,
  listMessagesSince,
  markMessagesRead,
} from './repository';

function requireTimeIdCursor(raw: string, label: string): TimeIdCursor {
  const cursor = decodeTimeIdCursor(raw);
  if (!cursor) {
    throw new AppError('INVALID_CURSOR', `Invalid ${label} cursor.`, 400);
  }
  return cursor;
}

function assertListingMessageable(status: string) {
  if (!isListingMessageable(status)) {
    throw new AppError(
      'LISTING_NOT_MESSAGEABLE',
      'This listing is not available to message.',
      403,
    );
  }
}

export async function startOrGetConversation(currentUserId: string, listingId: string) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });
  if (!listing) {
    throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);
  }

  assertListingMessageable(listing.status);

  const sellerId = listing.sellerId;
  const buyerId = currentUserId;

  if (buyerId === sellerId) {
    throw new AppError('CANNOT_MESSAGE_SELF', 'You cannot message yourself about your own listing.');
  }

  const blocked = await isBlockedEitherWay(buyerId, sellerId);
  if (blocked) {
    throw new AppError('BLOCKED', 'You cannot start a conversation with this user.', 403);
  }

  const existing = await findConversation(listingId, buyerId, sellerId);
  if (existing) return existing;

  return createConversation(listingId, buyerId, sellerId);
}

async function requireParticipant(conversationId: string, userId: string) {
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404);
  }
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new AppError('FORBIDDEN', 'You do not have access to this conversation.', 403);
  }
  return conversation;
}

export async function getConversationDetail(conversationId: string, userId: string) {
  return requireParticipant(conversationId, userId);
}

export async function getConversationMessages(conversationId: string, userId: string, cursor?: string) {
  await requireParticipant(conversationId, userId);

  // Mark incoming messages as read before fetching, so this response reflects the new read state.
  if (!cursor) {
    await markMessagesRead(conversationId, userId);
  }

  const decoded = cursor ? requireTimeIdCursor(cursor, 'message') : undefined;
  const rows = await listMessages(conversationId, decoded);
  const hasMore = rows.length > MESSAGES_PAGE_SIZE;
  const items = rows.slice(0, MESSAGES_PAGE_SIZE).reverse();
  const oldest = items[0];
  const newest = items.at(-1);

  return {
    items,
    hasMore,
    olderCursor: hasMore && oldest ? encodeTimeIdCursor(oldest.createdAt, oldest.id) : null,
    sinceCursor: newest
      ? encodeTimeIdCursor(newest.createdAt, newest.id)
      : encodeMessagePollOrigin(),
  };
}

export async function getNewMessagesSince(conversationId: string, userId: string, since: string) {
  await requireParticipant(conversationId, userId);
  if (!since) {
    throw new AppError('INVALID_CURSOR', 'A since cursor is required to poll for new messages.', 400);
  }
  const cursor = requireTimeIdCursor(since, 'since');
  await markMessagesRead(conversationId, userId);
  const items = await listMessagesSince(conversationId, cursor);
  const newest = items.at(-1);
  return {
    items,
    sinceCursor: newest ? encodeTimeIdCursor(newest.createdAt, newest.id) : since,
  };
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const conversation = await requireParticipant(conversationId, senderId);
  assertListingMessageable(conversation.listing.status);

  const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;

  const blocked = await isBlockedEitherWay(senderId, recipientId);
  if (blocked) {
    throw new AppError('BLOCKED', 'You cannot message this user.', 403);
  }

  const message = await createMessage(conversationId, senderId, body);

  const senderProfile = conversation.buyerId === senderId ? conversation.buyer.profile : conversation.seller.profile;
  await notifyNewMessage({
    recipientId,
    conversationId,
    senderId,
    senderUsername: senderProfile?.username ?? null,
    listingId: conversation.listing.id,
    listingTitle: conversation.listing.title,
    preview: body,
  });

  return message;
}

export async function markConversationRead(conversationId: string, userId: string) {
  await requireParticipant(conversationId, userId);
  await markMessagesRead(conversationId, userId);
}

export function getTotalUnreadMessageCount(userId: string) {
  return countAllUnreadMessages(userId);
}

export async function listMyConversations(
  userId: string,
  cursor?: string,
  take = CONVERSATIONS_PAGE_SIZE,
) {
  const decoded = cursor ? requireTimeIdCursor(cursor, 'inbox') : undefined;
  const rows = await listConversationsForUser(userId, decoded, take);
  const hasMore = rows.length > take;
  const page = rows.slice(0, take);

  // One batched query for all conversations' unread counts, instead of one query per row.
  const unreadCounts = await countUnreadForConversations(page.map((c) => c.id), userId);
  const withUnread = page.map((conversation) => ({
    ...conversation,
    unreadCount: unreadCounts.get(conversation.id) ?? 0,
  }));

  const last = page.at(-1);
  return {
    items: withUnread,
    hasMore,
    nextCursor: hasMore && last ? encodeTimeIdCursor(last.updatedAt, last.id) : null,
  };
}
