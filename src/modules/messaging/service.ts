import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { isBlockedEitherWay } from '@/modules/social/block-repository';
import { notifyNewMessage } from '@/modules/notifications/service';
import {
  CONVERSATIONS_PAGE_SIZE,
  MESSAGES_PAGE_SIZE,
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

export async function startOrGetConversation(currentUserId: string, listingId: string) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });
  if (!listing) {
    throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);
  }

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

  const rows = await listMessages(conversationId, cursor);
  const hasMore = rows.length > MESSAGES_PAGE_SIZE;
  const items = rows.slice(0, MESSAGES_PAGE_SIZE).reverse();

  return { items, hasMore };
}

export async function getNewMessagesSince(conversationId: string, userId: string, sinceId?: string) {
  await requireParticipant(conversationId, userId);
  await markMessagesRead(conversationId, userId);
  return listMessagesSince(conversationId, sinceId);
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const conversation = await requireParticipant(conversationId, senderId);
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

export async function listMyConversations(userId: string, cursor?: string) {
  const rows = await listConversationsForUser(userId, cursor);
  const hasMore = rows.length > CONVERSATIONS_PAGE_SIZE;
  const page = rows.slice(0, CONVERSATIONS_PAGE_SIZE);

  // One batched query for all conversations' unread counts, instead of one query per row.
  const unreadCounts = await countUnreadForConversations(page.map((c) => c.id), userId);
  const withUnread = page.map((conversation) => ({
    ...conversation,
    unreadCount: unreadCounts.get(conversation.id) ?? 0,
  }));

  return { items: withUnread, hasMore };
}
