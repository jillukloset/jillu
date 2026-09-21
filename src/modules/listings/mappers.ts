import type { ListingCardData } from './types';

type ListingWithFirstImage = {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  size: string;
  images: { url: string }[];
};

export function toListingCard(listing: ListingWithFirstImage): ListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    currency: listing.currency,
    condition: listing.condition,
    size: listing.size,
    primaryImageUrl: listing.images[0]?.url ?? null,
  };
}

type ListingWithStatus = ListingWithFirstImage & { status: string };

export function toSellerRow(listing: ListingWithStatus) {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    currency: listing.currency,
    status: listing.status,
    primaryImageUrl: listing.images[0]?.url ?? null,
  };
}
