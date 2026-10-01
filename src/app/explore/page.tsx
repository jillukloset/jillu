import type { Metadata } from 'next';
import { countListings, searchListings } from '@/modules/discovery/repository';
import { listBrands, listCategories, findVibeBySlug } from '@/modules/taxonomy/repository';
import { FilterToolbar } from '@/components/explore/filter-toolbar';
import { DiscoveryResults } from '@/components/explore/discovery-results';
import type { SortOption } from '@/modules/discovery/types';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse pre-loved fashion by category, brand, size, condition, and vibe on Jillu Kloset.',
  // Filter/sort query params produce the same core content under many URLs; canonicalizing to
  // the clean base path avoids diluting ranking signal across those variants.
  alternates: { canonical: '/explore' },
};

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  vibe?: string;
  size?: string;
  condition?: string;
  gender?: string;
  color?: string;
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
    color: params.color,
    location: params.location,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as SortOption) ?? 'newest',
    cursor: params.cursor,
  };

  const [{ items, hasMore }, totalCount, categories, brands, currentVibe] = await Promise.all([
    searchListings(filters),
    countListings(filters),
    listCategories(),
    listBrands(),
    params.vibe ? findVibeBySlug(params.vibe) : Promise.resolve(null),
  ]);

  const nextParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== 'cursor') nextParams.set(key, value);
  });
  const lastItem = items.at(-1);
  if (lastItem) nextParams.set('cursor', lastItem.id);

  return (
    <div className="mx-auto max-w-6xl px-gutter py-8">
      {currentVibe ? (
        <VibeHeader vibe={currentVibe} />
      ) : (
        <h1 className="mb-6 font-display text-3xl">Explore</h1>
      )}

      <FilterToolbar
        categories={categories}
        brands={brands}
        resultsCount={totalCount}
        current={{
          category: params.category,
          brand: params.brand,
          vibe: params.vibe,
          size: params.size,
          condition: params.condition,
          gender: params.gender,
          color: params.color,
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

function VibeHeader({ vibe }: { vibe: { name: string; description: string | null; bannerUrl: string | null; accentColor: string | null } }) {
  const hasBanner = Boolean(vibe.bannerUrl);
  const bgColor = vibe.accentColor ?? '#4A1942';

  return (
    <div
      className="relative mb-6 overflow-hidden rounded-2xl"
      style={!hasBanner ? { backgroundColor: bgColor } : undefined}
    >
      {hasBanner ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vibe.bannerUrl!} alt={vibe.name} className="h-48 w-full object-cover sm:h-56" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : null}
      <div className={`${hasBanner ? 'absolute bottom-0 left-0 right-0 p-6' : 'p-6'}`}>
        <h1 className={`font-display text-3xl ${hasBanner ? 'text-white' : 'text-paper'}`}>
          {vibe.name}
        </h1>
        {vibe.description ? (
          <p className={`mt-1 max-w-lg text-sm ${hasBanner ? 'text-white/80' : 'text-paper/80'}`}>
            {vibe.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
