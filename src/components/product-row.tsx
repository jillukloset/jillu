import type { ListingCardData } from '@/modules/listings/types';
import { ProductCard } from '@/components/product-card';

export function ProductRow({ listings }: { listings: ListingCardData[] }) {
  return (
    <div className="-mx-gutter flex gap-4 overflow-x-auto px-gutter pb-2 snap-x snap-mandatory scrollbar-none">
      {listings.map((listing) => (
        <div key={listing.id} className="w-40 shrink-0 snap-start sm:w-48">
          <ProductCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
