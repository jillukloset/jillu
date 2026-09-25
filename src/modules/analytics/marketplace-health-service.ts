import { zeroFillDaily, type DateRange } from './date-range';
import {
  countActiveBuyers,
  countActiveListingsSnapshot,
  countActiveSellers,
  countListingsCreatedInRange,
  countListingsSoldFromCohort,
  countListingsSoldInRange,
  countListingsWithMessagesInRange,
  countReportsInRange,
  newListingsDaily,
  newUsersDaily,
  soldListingsDaily,
} from './marketplace-health-repository';

function pct(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export async function getMarketplaceHealth(range: DateRange) {
  const [
    newUsersRows,
    newListingsRows,
    soldListingsRows,
    activeSellers,
    activeBuyers,
    listingsCreated,
    listingsSold,
    listingsWithMessages,
    listingsSoldFromCohort,
    reportsInRange,
    activeListings,
  ] = await Promise.all([
    newUsersDaily(range),
    newListingsDaily(range),
    soldListingsDaily(range),
    countActiveSellers(range),
    countActiveBuyers(range),
    countListingsCreatedInRange(range),
    countListingsSoldInRange(range),
    countListingsWithMessagesInRange(range),
    countListingsSoldFromCohort(range),
    countReportsInRange(range),
    countActiveListingsSnapshot(),
  ]);

  return {
    series: {
      newUsers: zeroFillDaily(newUsersRows, range),
      newListings: zeroFillDaily(newListingsRows, range),
      soldListings: zeroFillDaily(soldListingsRows, range),
    },
    engagement: {
      activeSellers,
      activeBuyers,
      listingsCreated,
      listingsSold,
    },
    conversion: {
      // Of listings created in this window: what share got at least one buyer message, and what share sold.
      listingToMessageRate: pct(listingsWithMessages, listingsCreated),
      listingToSoldRate: pct(listingsSoldFromCohort, listingsCreated),
    },
    reportRate: {
      count: reportsInRange,
      // Reports filed per 100 currently-active listings — a normalized signal, not a raw count.
      perHundredActiveListings: pct(reportsInRange, activeListings),
    },
  };
}
