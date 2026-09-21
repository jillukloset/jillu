import { AppError } from '@/lib/api-result';
import { findListingById } from '@/modules/listings/repository';
import { recordAuditLog } from './audit';
import { ADMIN_LISTINGS_PAGE_SIZE, listListingsForAdmin, setListingStatusAsAdmin } from './listings-repository';

export async function getListingsPageForAdmin(
  filters: { search?: string; status?: string; categoryId?: string; sellerId?: string },
  cursor?: string,
) {
  const rows = await listListingsForAdmin(filters, cursor);
  const hasMore = rows.length > ADMIN_LISTINGS_PAGE_SIZE;
  return { items: rows.slice(0, ADMIN_LISTINGS_PAGE_SIZE), hasMore };
}

async function requireListing(listingId: string) {
  const listing = await findListingById(listingId);
  if (!listing) throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);
  return listing;
}

export async function adminRemoveListing(adminId: string, listingId: string, reason?: string) {
  const listing = await requireListing(listingId);
  const updated = await setListingStatusAsAdmin(listingId, 'ARCHIVED');
  await recordAuditLog(adminId, 'LISTING_REMOVED', 'LISTING', listingId, {
    title: listing.title,
    previousStatus: listing.status,
    reason,
  });
  return updated;
}

export async function adminRestoreListing(adminId: string, listingId: string) {
  const listing = await requireListing(listingId);
  const updated = await setListingStatusAsAdmin(listingId, 'ACTIVE');
  await recordAuditLog(adminId, 'LISTING_RESTORED', 'LISTING', listingId, {
    title: listing.title,
    previousStatus: listing.status,
  });
  return updated;
}
