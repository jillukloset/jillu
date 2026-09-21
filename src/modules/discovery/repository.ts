import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { ExploreFilters } from './types';

const cardInclude = { images: { orderBy: { order: 'asc' as const }, take: 1 } };

export function getNewDrops(limit = 8) {
  return db.listing.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: cardInclude,
  });
}

export async function getTrending(limit = 8) {
  const candidates = await db.listing.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: {
      ...cardInclude,
      _count: { select: { likes: true, saves: true } },
    },
  });

  return candidates
    .map((listing) => ({
      listing,
      score: listing.viewCount + listing._count.likes * 3 + listing._count.saves * 5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.listing);
}

export function getByVibeSlug(slug: string, limit = 12) {
  return db.listing.findMany({
    where: { status: 'ACTIVE', vibes: { some: { vibe: { slug } } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: cardInclude,
  });
}

function buildWhere(filters: ExploreFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: 'ACTIVE' };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
      { brand: { name: { contains: filters.q, mode: 'insensitive' } } },
      { category: { name: { contains: filters.q, mode: 'insensitive' } } },
      { vibes: { some: { vibe: { name: { contains: filters.q, mode: 'insensitive' } } } } },
    ];
  }
  if (filters.categorySlug) where.category = { slug: filters.categorySlug };
  if (filters.brandSlug) where.brand = { slug: filters.brandSlug };
  if (filters.vibeSlug) where.vibes = { some: { vibe: { slug: filters.vibeSlug } } };
  if (filters.size) where.size = filters.size;
  if (filters.condition) where.condition = filters.condition as never;
  if (filters.gender) where.gender = filters.gender as never;
  if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }

  return where;
}

// A secondary `id` tiebreaker is required on every branch: `createdAt`/`price` are not unique,
// so without it, rows sharing a value on the primary sort key can be ordered differently between
// requests and either repeat or vanish across a cursor-paginated page boundary.
function buildOrderBy(sort?: string): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'desc' }];
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }];
  }
}

export async function searchListings(filters: ExploreFilters, take = 24) {
  const where = buildWhere(filters);
  const orderBy = buildOrderBy(filters.sort);

  const rows = await db.listing.findMany({
    where,
    orderBy,
    take: take + 1,
    ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    include: cardInclude,
  });

  const hasMore = rows.length > take;
  return { items: rows.slice(0, take), hasMore };
}
