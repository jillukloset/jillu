import type { Metadata } from 'next';
import { searchListings } from '@/modules/discovery/repository';
import { listBrands, listCategories } from '@/modules/taxonomy/repository';
import { FilterDrawer } from '@/components/explore/filter-drawer';
import { DiscoveryResults } from '@/components/explore/discovery-results';
import { SearchBar } from '@/components/nav/search-bar';
import type { SortOption } from '@/modules/discovery/types';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}" — Jillu Kloset` : 'Search — Jillu Kloset' };
}

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  size?: string;
  condition?: string;
  gender?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  cursor?: string;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const filters = {
    q: params.q,
    categorySlug: params.category,
    brandSlug: params.brand,
    size: params.size,
    condition: params.condition,
    gender: params.gender,
    location: params.location,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as SortOption) ?? 'newest',
    cursor: params.cursor,
  };

  const hasQuery = Boolean(params.q);
  const [{ items, hasMore }, categories, brands] = await Promise.all([
    hasQuery ? searchListings(filters) : Promise.resolve({ items: [], hasMore: false }),
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
      <SearchBar defaultValue={params.q} className="mb-6 max-w-lg" />

      {!hasQuery ? (
        <p className="text-sm text-muted">Search by title, brand, category or vibe — try “vintage jeans” or “Nike jacket”.</p>
      ) : (
        <>
          <h1 className="mb-6 font-display text-2xl">Results for &ldquo;{params.q}&rdquo;</h1>

          <FilterDrawer
            action="/search"
            categories={categories}
            brands={brands}
            current={{
              category: params.category,
              brand: params.brand,
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
            nextHref={`/search?${nextParams.toString()}`}
            emptyTitle="No matches yet"
            emptyDescription={`Nothing found for "${params.q}". Try a different keyword.`}
          />
        </>
      )}
    </div>
  );
}
