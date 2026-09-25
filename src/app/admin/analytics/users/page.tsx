import type { Metadata } from 'next';
import { parseRangeParam, resolveDateRange } from '@/modules/analytics/date-range';
import { getUserAnalytics } from '@/modules/analytics/user-analytics-service';
import { RangeTabs } from '@/components/admin/analytics/range-tabs';
import { KpiCard } from '@/components/admin/analytics/kpi-card';
import { TrendChart } from '@/components/admin/analytics/trend-chart';

export const metadata: Metadata = { title: 'Admin · User Analytics — Jillu Kloset' };

export default async function UserAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const preset = parseRangeParam(rangeParam);
  const range = resolveDateRange(preset);
  const analytics = await getUserAnalytics(range);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">User Analytics</h1>
          <p className="text-sm text-slate-500">Account growth and engagement over the last {range.days} days.</p>
        </div>
        <RangeTabs basePath="/admin/analytics/users" active={preset} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total users" value={analytics.kpis.totalUsers} />
        <KpiCard label="New users" value={analytics.kpis.newUsers} />
        <KpiCard label="Active users" value={analytics.kpis.activeUsers} hint="Engaged in this period" />
        <KpiCard label="New sellers" value={analytics.kpis.newSellers} hint="Published their first listing" />
        <KpiCard label="Returning users" value={analytics.kpis.returningUsers} hint="Active, joined before this period" />
        <KpiCard label="Suspended users" value={analytics.kpis.suspendedUsers} />
      </div>

      <TrendChart title="New users" data={analytics.series.newUsers} color="#171310" />
    </div>
  );
}
