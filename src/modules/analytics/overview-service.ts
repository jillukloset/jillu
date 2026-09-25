import { percentChange } from './date-range';
import {
  countActiveListings,
  countActiveSellers,
  countListingsCreatedBetween,
  countListingsSoldBetween,
  countNewUsersBetween,
  countOpenReports,
  countReportsCreatedBetween,
  countTotalUsers,
  windowBounds,
} from './overview-repository';

export type Kpi = {
  label: string;
  value: number;
  /** A short secondary line, e.g. "+12 this week" — omitted when there's nothing meaningful to show. */
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'flat';
};

const TREND_WINDOW_DAYS = 7;

function trend(current: number, previous: number, noun: string): Pick<Kpi, 'trendLabel' | 'trendDirection'> {
  const change = percentChange(current, previous);
  if (change === null) return {};
  const direction: Kpi['trendDirection'] = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat';
  const sign = current - previous >= 0 ? '+' : '';
  return { trendLabel: `${sign}${current - previous} ${noun} vs prior ${TREND_WINDOW_DAYS}d`, trendDirection: direction };
}

export async function getOverviewMetrics() {
  const { start, end, previousStart } = windowBounds(TREND_WINDOW_DAYS);

  const [
    totalUsers,
    newUsersThisWindow,
    newUsersPrevWindow,
    activeSellers,
    activeListings,
    newListingsThisWindow,
    newListingsPrevWindow,
    soldThisWindow,
    soldPrevWindow,
    openReports,
    reportsThisWindow,
  ] = await Promise.all([
    countTotalUsers(),
    countNewUsersBetween(start, end),
    countNewUsersBetween(previousStart, start),
    countActiveSellers(),
    countActiveListings(),
    countListingsCreatedBetween(start, end),
    countListingsCreatedBetween(previousStart, start),
    countListingsSoldBetween(start, end),
    countListingsSoldBetween(previousStart, start),
    countOpenReports(),
    countReportsCreatedBetween(start, end),
  ]);

  const kpis: Kpi[] = [
    {
      label: 'Total users',
      value: totalUsers,
      ...trend(newUsersThisWindow, newUsersPrevWindow, 'new users'),
    },
    { label: 'Active sellers', value: activeSellers },
    { label: 'Active listings', value: activeListings },
    {
      label: 'New listings (7d)',
      value: newListingsThisWindow,
      ...trend(newListingsThisWindow, newListingsPrevWindow, 'listings'),
    },
    {
      label: 'Sold listings (7d)',
      value: soldThisWindow,
      ...trend(soldThisWindow, soldPrevWindow, 'sold'),
    },
    {
      label: 'Open reports',
      value: openReports,
      trendLabel: reportsThisWindow > 0 ? `${reportsThisWindow} filed in last 7d` : undefined,
    },
  ];

  return kpis;
}
