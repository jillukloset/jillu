import { db } from '@/lib/db';

export function countListingsByStatus() {
  return db.listing.groupBy({ by: ['status'], _count: { _all: true } });
}

export async function topCategories(take = 8) {
  const grouped = await db.listing.groupBy({
    by: ['categoryId'],
    where: { status: 'ACTIVE' },
    _count: { _all: true },
    orderBy: { _count: { categoryId: 'desc' } },
    take,
  });
  const categories = await db.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  return grouped.map((g) => ({ id: g.categoryId, name: nameById.get(g.categoryId) ?? 'Unknown', count: g._count._all }));
}

export async function topBrands(take = 8) {
  const grouped = await db.listing.groupBy({
    by: ['brandId'],
    where: { status: 'ACTIVE', brandId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { brandId: 'desc' } },
    take,
  });
  const ids = grouped.map((g) => g.brandId).filter((id): id is string => id !== null);
  const brands = await db.brand.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const nameById = new Map(brands.map((b) => [b.id, b.name]));
  return grouped
    .filter((g) => g.brandId !== null)
    .map((g) => ({ id: g.brandId as string, name: nameById.get(g.brandId as string) ?? 'Unknown', count: g._count._all }));
}

export async function topVibes(take = 8) {
  const grouped = await db.listingVibe.groupBy({
    by: ['vibeId'],
    where: { listing: { status: 'ACTIVE' } },
    _count: { _all: true },
    orderBy: { _count: { vibeId: 'desc' } },
    take,
  });
  const vibes = await db.vibe.findMany({ where: { id: { in: grouped.map((g) => g.vibeId) } }, select: { id: true, name: true } });
  const nameById = new Map(vibes.map((v) => [v.id, v.name]));
  return grouped.map((g) => ({ id: g.vibeId, name: nameById.get(g.vibeId) ?? 'Unknown', count: g._count._all }));
}

async function attachListingTitles(rows: { listingId: string; count: number }[]) {
  const listings = await db.listing.findMany({
    where: { id: { in: rows.map((r) => r.listingId) } },
    select: { id: true, title: true, status: true },
  });
  const byId = new Map(listings.map((l) => [l.id, l]));
  return rows
    .map((r) => {
      const listing = byId.get(r.listingId);
      if (!listing) return null;
      return { id: r.listingId, title: listing.title, status: listing.status, count: r.count };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function mostLikedListings(take = 8) {
  const grouped = await db.like.groupBy({
    by: ['listingId'],
    _count: { _all: true },
    orderBy: { _count: { listingId: 'desc' } },
    take,
  });
  return attachListingTitles(grouped.map((g) => ({ listingId: g.listingId, count: g._count._all })));
}

export async function mostSavedListings(take = 8) {
  const grouped = await db.save.groupBy({
    by: ['listingId'],
    _count: { _all: true },
    orderBy: { _count: { listingId: 'desc' } },
    take,
  });
  return attachListingTitles(grouped.map((g) => ({ listingId: g.listingId, count: g._count._all })));
}

export async function mostMessagedListings(take = 8) {
  const grouped = await db.conversation.groupBy({
    by: ['listingId'],
    _count: { _all: true },
    orderBy: { _count: { listingId: 'desc' } },
    take,
  });
  return attachListingTitles(grouped.map((g) => ({ listingId: g.listingId, count: g._count._all })));
}
