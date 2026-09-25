import { db } from '@/lib/db';

export function countReportsByStatus() {
  return db.report.groupBy({ by: ['status'], _count: { _all: true } });
}

export function countReportsByReason() {
  return db.report.groupBy({ by: ['reason'], _count: { _all: true } });
}

export function countSuspendedUsers() {
  return db.user.count({ where: { status: 'SUSPENDED' } });
}

/** Admin-initiated removals, distinct from a seller archiving their own listing. */
export function countAdminRemovedListings() {
  return db.auditLog.count({ where: { action: 'LISTING_REMOVED' } });
}

export function countAuditLogEntries() {
  return db.auditLog.count();
}
