import type { Metadata } from 'next';
import { parseRangeParam, resolveDateRange } from '@/modules/analytics/date-range';
import { getMarketplaceHealth } from '@/modules/analytics/marketplace-health-service';
import { RangeTabs } from '@/components/admin/analytics/range-tabs';
import { KpiCard } from '@/components/admin/analytics/kpi-card';
import { TrendChart } from '@/components/admin/analytics/trend-chart';

export const metadata: Metadata = { title: 'Admin · Marketplace Health — Jillu Kloset' };

function formatPct(value: number | null) {
  if (value === null) return '—';
  return `${value.toFixed(1)}%`;
}

export default async function MarketplaceHealthPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const preset = parseRangeParam(rangeParam);
  const range = resolveDateRange(preset);
  const health = await getMarketplaceHealth(range);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Marketplace Health</h1>
          <p className="text-sm text-slate-500">Growth and engagement over the last {range.days} days.</p>
        </div>
        <RangeTabs basePath="/admin/analytics/marketplace-health" active={preset} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TrendChart title="New users" data={health.series.newUsers} color="#171310" />
        <TrendChart title="New listings" data={health.series.newListings} color="#3b2230" />
        <TrendChart title="Sold listings" data={health.series.soldListings} color="#2f7a4d" />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Engagement</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard
            label="Active sellers"
            value={health.engagement.activeSellers}
            hint="Published or updated a listing"
          />
          <KpiCard
            label="Active buyers"
            value={health.engagement.activeBuyers}
            hint="Started or replied in a conversation"
          />
          <KpiCard label="Listings created" value={health.engagement.listingsCreated} />
          <KpiCard label="Listings sold" value={health.engagement.listingsSold} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Conversion &amp; risk</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Listing → message rate"
            value={formatPct(health.conversion.listingToMessageRate)}
            hint="Of listings created this period, share that received a buyer message"
          />
          <KpiCard
            label="Listing → sold rate"
            value={formatPct(health.conversion.listingToSoldRate)}
            hint="Of listings created this period, share already sold"
          />
          <KpiCard
            label="Report rate"
            value={formatPct(health.reportRate.perHundredActiveListings)}
            hint={`${health.reportRate.count} reports filed this period, per 100 active listings`}
          />
        </div>
      </div>
    </div>
  );
}
