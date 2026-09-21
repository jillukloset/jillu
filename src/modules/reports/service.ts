import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import type { CreateReportInput } from './schemas';
import {
  createListingReport,
  createUserReport,
  findOpenListingReport,
  findOpenUserReport,
} from './repository';

export async function reportListing(reporterId: string, listingId: string, input: CreateReportInput) {
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true, sellerId: true } });
  if (!listing) {
    throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);
  }
  if (listing.sellerId === reporterId) {
    throw new AppError('CANNOT_REPORT_OWN_LISTING', 'You cannot report your own listing.');
  }

  const existing = await findOpenListingReport(reporterId, listingId);
  if (existing) return existing;

  return createListingReport({
    reporterId,
    listingId,
    reason: input.reason,
    details: input.details,
  });
}

export async function reportUser(reporterId: string, targetUserId: string, input: CreateReportInput) {
  if (reporterId === targetUserId) {
    throw new AppError('CANNOT_REPORT_SELF', 'You cannot report yourself.');
  }

  const target = await db.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
  if (!target) {
    throw new AppError('USER_NOT_FOUND', 'That user does not exist.', 404);
  }

  const existing = await findOpenUserReport(reporterId, targetUserId);
  if (existing) return existing;

  return createUserReport({
    reporterId,
    targetUserId,
    reason: input.reason,
    details: input.details,
  });
}
