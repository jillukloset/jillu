import Link from 'next/link';
import { toListingCard } from '@/modules/listings/mappers';
import { ProductGrid } from '@/components/product-grid';
import { EmptyState } from '@/components/ui/empty-state';

type Listing = Parameters<typeof toListingCard>[0];

export function DiscoveryResults({
  items,
  hasMore,
  nextHref,
  emptyTitle,
  emptyDescription,
}: {
  items: Listing[];
  hasMore: boolean;
  nextHref: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} actionLabel="Explore Jillu" actionHref="/explore" />;
  }

  return (
    <>
      <ProductGrid listings={items.map(toListingCard)} />
      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <Link href={nextHref} className="rounded-pill border border-ink px-6 py-2.5 text-sm font-semibold text-ink">
            Load more
          </Link>
        </div>
      ) : null}
    </>
  );
}
