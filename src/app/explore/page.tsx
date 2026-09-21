import type { Metadata } from 'next';
import { searchListings } from '@/modules/discovery/repository';
import { listBrands, listCategories } from '@/modules/taxonomy/repository';
import { FilterDrawer } from '@/components/explore/filter-drawer';
import { DiscoveryResults } from '@/components/explore/discovery-results';
import type { SortOption } from '@/modules/discovery/types';

export const metadata: Metadata = { title: 'Explore — Jillu Kloset' };

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  vibe?: string;
  size?: string;
  condition?: string;
  gender?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  cursor?: string;
};

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const filters = {
    q: params.q,
    categorySlug: params.category,
    brandSlug: params.brand,
    vibeSlug: params.vibe,
    size: params.size,
    condition: params.condition,
    gender: params.gender,
    location: params.location,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as SortOption) ?? 'newest',
    cursor: params.cursor,
  };

  const [{ items, hasMore }, categories, brands] = await Promise.all([
    searchListings(filters),
    listCategories(),
    listBrands(),
  ]);

  const nextParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== 'cursor') nextParams.set(key, value);
  });
  const lastItem = items.at(-1);
  if (lastItem) nextParams.set('cursor', lastItem.id);

  return (
    <div className="mx-auto max-w-6xl px-gutter py-8">
      <h1 className="mb-6 font-display text-3xl">Explore</h1>

      <FilterDrawer
        categories={categories}
        brands={brands}
        current={{
          category: params.category,
          brand: params.brand,
          vibe: params.vibe,
          size: params.size,
          condition: params.condition,
          gender: params.gender,
          location: params.location,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          sort: params.sort,
          q: params.q,
        }}
      />

      <DiscoveryResults
        items={items}
        hasMore={hasMore}
        nextHref={`/explore?${nextParams.toString()}`}
        emptyTitle="No pieces match yet"
        emptyDescription="Try loosening a filter or check back soon."
      />
    </div>
  );
}
