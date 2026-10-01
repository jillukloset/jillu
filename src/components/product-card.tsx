import Image from 'next/image';
import Link from 'next/link';
import type { ListingCardData } from '@/modules/listings/types';
import { Price } from '@/components/ui/price';

export function ProductCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface shadow-card transition-shadow duration-base group-hover:shadow-raised">
        {listing.primaryImageUrl ? (
          <Image
            src={listing.primaryImageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 46vw"
            className="object-cover transition-transform duration-base ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">No photo</div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <p className="truncate text-sm font-medium text-ink transition-colors group-hover:text-accent-text">
          {listing.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Price amount={listing.price} currency={listing.currency} className="text-sm font-semibold text-ink" />
          <span aria-hidden className="text-border">
            ·
          </span>
          <span className="uppercase tracking-wide">Size {listing.size}</span>
        </div>
      </div>
    </Link>
  );
}
