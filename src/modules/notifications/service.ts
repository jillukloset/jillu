import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import {
  NOTIFICATIONS_PAGE_SIZE,
  countUnreadNotifications,
  findNotificationById,
  findUnreadMessageNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  refreshMessageNotification,
} from './repository';

export async function getNotificationsPage(userId: string, cursor?: string) {
  const rows = await listNotifications(userId, cursor);
  const hasMore = rows.length > NOTIFICATIONS_PAGE_SIZE;
  return { items: rows.slice(0, NOTIFICATIONS_PAGE_SIZE), hasMore };
}

export function getUnreadCount(userId: string) {
  return countUnreadNotifications(userId);
}

export async function markRead(notificationId: string, userId: string) {
  const notification = await findNotificationById(notificationId);
  if (!notification) {
    throw new AppError('NOTIFICATION_NOT_FOUND', 'Notification not found.', 404);
  }
  if (notification.userId !== userId) {
    throw new AppError('FORBIDDEN', 'You do not have access to this notification.', 403);
  }
  if (notification.readAt) return notification;
  return markNotificationRead(notificationId);
}

export function markAllRead(userId: string) {
  return markAllNotificationsRead(userId);
}

/**
 * One unread NEW_MESSAGE notification per conversation at a time: refresh the existing
 * unread row (so it re-surfaces with the latest preview) instead of piling up a new
 * notification for every message sent while the previous one is still unread.
 */
export async function notifyNewMessage(params: {
  recipientId: string;
  conversationId: string;
  senderId: string;
  senderUsername: string | null;
  listingId: string;
  listingTitle: string;
  preview: string;
}) {
  const payload = {
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderUsername: params.senderUsername,
    listingId: params.listingId,
    listingTitle: params.listingTitle,
    preview: params.preview.slice(0, 140),
  };

  const existing = await findUnreadMessageNotification(params.recipientId, params.conversationId);
  if (existing) {
    return refreshMessageNotification(existing.id, payload);
  }

  return db.notification.create({ data: { userId: params.recipientId, type: 'NEW_MESSAGE', payload } });
}

export async function notifyListingSold(listingId: string, listingTitle: string, sellerId: string) {
  const [likers, savers] = await Promise.all([
    db.like.findMany({ where: { listingId }, select: { userId: true } }),
    db.save.findMany({ where: { listingId }, select: { userId: true } }),
  ]);

  const recipientIds = new Set(
    [...likers, ...savers].map((row) => row.userId).filter((userId) => userId !== sellerId),
  );
  if (recipientIds.size === 0) return;

  await db.notification.createMany({
    data: [...recipientIds].map((userId) => ({
      userId,
      type: 'LISTING_MARKED_SOLD' as const,
      payload: { listingId, listingTitle },
    })),
  });
}
