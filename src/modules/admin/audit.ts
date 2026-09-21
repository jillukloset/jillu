import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export function recordAuditLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Prisma.InputJsonValue,
) {
  return db.auditLog.create({ data: { actorId, action, targetType, targetId, metadata } });
}

export const AUDIT_PAGE_SIZE = 30;

export function listAuditLogs(cursor?: string, take = AUDIT_PAGE_SIZE) {
  return db.auditLog.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    // `actor` is a User relation — use an explicit `select`, never a bare `include`, or Prisma
    // serializes every column on that model, including `passwordHash`, into the JSON response.
    include: { actor: { select: { email: true, profile: { select: { username: true } } } } },
  });
}
