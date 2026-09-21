import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export const ADMIN_LISTINGS_PAGE_SIZE = 25;

// A User relation must use an explicit `select`, never a bare `include` — Prisma otherwise
// serializes every column on that model, including `passwordHash`, into the JSON response.
const sellerSelect = {
  select: { profile: { select: { username: true } } },
};

export function listListingsForAdmin(
  filters: { search?: string; status?: string; categoryId?: string; sellerId?: string },
  cursor?: string,
  take = ADMIN_LISTINGS_PAGE_SIZE,
) {
  const where: Prisma.ListingWhereInput = {};
  if (filters.status) where.status = filters.status as never;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.sellerId) where.sellerId = filters.sellerId;
  if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };

  return db.listing.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      category: true,
      seller: sellerSelect,
    },
  });
}

export function setListingStatusAsAdmin(id: string, status: 'ACTIVE' | 'ARCHIVED') {
  return db.listing.update({ where: { id }, data: { status } });
}
