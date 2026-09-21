import { db } from '@/lib/db';

export function findOpenListingReport(reporterId: string, listingId: string) {
  return db.report.findFirst({
    where: { reporterId, targetType: 'LISTING', listingId, status: 'OPEN' },
  });
}

export function findOpenUserReport(reporterId: string, targetUserId: string) {
  return db.report.findFirst({
    where: { reporterId, targetType: 'USER', targetUserId, status: 'OPEN' },
  });
}

export function createListingReport(data: {
  reporterId: string;
  listingId: string;
  reason: string;
  details?: string;
}) {
  return db.report.create({
    data: {
      reporterId: data.reporterId,
      targetType: 'LISTING',
      listingId: data.listingId,
      reason: data.reason as never,
      details: data.details,
    },
  });
}

export function createUserReport(data: {
  reporterId: string;
  targetUserId: string;
  reason: string;
  details?: string;
}) {
  return db.report.create({
    data: {
      reporterId: data.reporterId,
      targetType: 'USER',
      targetUserId: data.targetUserId,
      reason: data.reason as never,
      details: data.details,
    },
  });
}
