import type { ListingStatus } from '@prisma/client';

export const MESSAGEABLE_LISTING_STATUSES = ['ACTIVE', 'RESERVED'] as const satisfies readonly ListingStatus[];

export function isListingMessageable(status: ListingStatus | string): boolean {
  return status === 'ACTIVE' || status === 'RESERVED';
}
