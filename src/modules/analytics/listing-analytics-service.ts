import {
  countListingsByStatus,
  mostLikedListings,
  mostMessagedListings,
  mostSavedListings,
  topBrands,
  topCategories,
  topVibes,
} from './listing-analytics-repository';

const STATUSES = ['ACTIVE', 'DRAFT', 'RESERVED', 'SOLD', 'ARCHIVED'] as const;

export async function getListingAnalytics() {
  const [byStatus, categories, brands, vibes, liked, saved, messaged] = await Promise.all([
    countListingsByStatus(),
    topCategories(),
    topBrands(),
    topVibes(),
    mostLikedListings(),
    mostSavedListings(),
    mostMessagedListings(),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])) as Record<string, number>;

  return {
    statusBreakdown: STATUSES.map((status) => ({ status, count: statusCounts[status] ?? 0 })),
    topCategories: categories,
    topBrands: brands,
    topVibes: vibes,
    mostLiked: liked,
    mostSaved: saved,
    mostMessaged: messaged,
  };
}
