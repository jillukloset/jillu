'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Price } from '@/components/ui/price';
import type { ListingCardData } from '@/modules/listings/types';

export function SavedGrid({ listings }: { listings: ListingCardData[] }) {
  const [items, setItems] = useState(listings);
  const [pending, startTransition] = useTransition();

  const unsave = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    startTransition(async () => {
      await fetch(`/api/listings/${id}/save`, { method: 'DELETE' });
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((listing) => (
        <div key={listing.id} className="flex flex-col gap-2">
          <Link href={`/listing/${listing.id}`} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-surface">
            {listing.primaryImageUrl ? (
              <Image
                src={listing.primaryImageUrl}
                alt={listing.title}
                fill
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 46vw"
                className="object-cover transition-transform duration-base group-hover:scale-[1.03]"
              />
            ) : null}
          </Link>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{listing.title}</p>
              <Price amount={listing.price} currency={listing.currency} className="text-sm font-semibold text-ink" />
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => unsave(listing.id)}
              className="shrink-0 text-xs font-semibold text-muted underline hover:text-danger"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
