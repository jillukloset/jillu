import { db } from '@/lib/db';

const listingSummaryInclude = {
  images: { orderBy: { order: 'asc' as const }, take: 1 },
};

// `buyer`/`seller` are User relations returned directly to conversation participants — always
// use an explicit `select` here, never a bare `include`, or Prisma serializes every column on
// that model (including `passwordHash`) straight into the JSON response.
const participantSelect = {
  select: {
    id: true,
    profile: { select: { username: true, displayName: true, avatarUrl: true } },
  },
};

export const CONVERSATIONS_PAGE_SIZE = 20;
export const MESSAGES_PAGE_SIZE = 30;

export function findConversation(listingId: string, buyerId: string, sellerId: string) {
  return db.conversation.findUnique({
    where: { listingId_buyerId_sellerId: { listingId, buyerId, sellerId } },
  });
}

export function createConversation(listingId: string, buyerId: string, sellerId: string) {
  return db.conversation.create({ data: { listingId, buyerId, sellerId } });
}

export function findConversationById(id: string) {
  return db.conversation.findUnique({
    where: { id },
    include: {
      listing: { include: listingSummaryInclude },
      buyer: participantSelect,
      seller: participantSelect,
    },
  });
}

export function listConversationsForUser(userId: string, cursor?: string, take = CONVERSATIONS_PAGE_SIZE) {
  return db.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      listing: { include: listingSummaryInclude },
      buyer: participantSelect,
      seller: participantSelect,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export function listMessages(conversationId: string, cursor?: string, take = MESSAGES_PAGE_SIZE) {
  return db.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

export function listMessagesSince(conversationId: string, sinceId?: string) {
  if (!sinceId) {
    return db.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  }
  return db.message.findMany({
    where: { conversationId, id: { gt: sinceId } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createMessage(conversationId: string, senderId: string, body: string) {
  const [message] = await db.$transaction([
    db.message.create({ data: { conversationId, senderId, body } }),
    db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);
  return message;
}

export function markMessagesRead(conversationId: string, readerId: string) {
  return db.message.updateMany({
    where: { conversationId, senderId: { not: readerId }, readAt: null },
    data: { readAt: new Date() },
  });
}

/** Batched unread counts for many conversations in one query, to avoid an N+1 per conversation. */
export async function countUnreadForConversations(conversationIds: string[], userId: string) {
  if (conversationIds.length === 0) return new Map<string, number>();

  const grouped = await db.message.groupBy({
    by: ['conversationId'],
    where: { conversationId: { in: conversationIds }, senderId: { not: userId }, readAt: null },
    _count: { _all: true },
  });

  const counts = new Map<string, number>();
  for (const row of grouped) {
    counts.set(row.conversationId, row._count._all);
  }
  return counts;
}
