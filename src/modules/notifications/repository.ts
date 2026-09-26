import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export const NOTIFICATIONS_PAGE_SIZE = 20;

export function listNotifications(userId: string, cursor?: string, take = NOTIFICATIONS_PAGE_SIZE) {
  return db.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

export function countUnreadNotifications(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export function findNotificationById(id: string) {
  return db.notification.findUnique({ where: { id } });
}

export function markNotificationRead(id: string) {
  return db.notification.update({ where: { id }, data: { readAt: new Date() } });
}

export function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}

export function createNotification(userId: string, type: string, payload: Prisma.InputJsonValue) {
  return db.notification.create({ data: { userId, type: type as never, payload } });
}

export function findUnreadMessageNotification(userId: string, conversationId: string) {
  return db.notification.findFirst({
    where: {
      userId,
      type: 'NEW_MESSAGE',
      readAt: null,
      payload: { path: ['conversationId'], equals: conversationId },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

export function refreshMessageNotification(id: string, payload: Prisma.InputJsonValue) {
  return db.notification.update({ where: { id }, data: { payload, createdAt: new Date() } });
}
