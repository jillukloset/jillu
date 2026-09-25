import type { Metadata } from 'next';
import Link from 'next/link';
import { getListingAnalytics } from '@/modules/analytics/listing-analytics-service';
import { BarList } from '@/components/admin/analytics/bar-list';

export const metadata: Metadata = { title: 'Admin · Listing Analytics — Jillu Kloset' };

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
  ARCHIVED: 'Archived',
};

export default async function ListingAnalyticsPage() {
  const analytics = await getListingAnalytics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Listing Analytics</h1>
        <p className="text-sm text-slate-500">Current inventory breakdown and all-time popularity.</p>
      </div>

      <BarList
        title="Listings by status"
        items={analytics.statusBreakdown.map((s) => ({ id: s.status, label: STATUS_LABELS[s.status] ?? s.status, count: s.count }))}
      />

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Top taxonomy (active listings)</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BarList
            title="Top categories"
            items={analytics.topCategories.map((c) => ({ id: c.id, label: c.name, count: c.count }))}
          />
          <BarList title="Top brands" items={analytics.topBrands.map((b) => ({ id: b.id, label: b.name, count: b.count }))} />
          <BarList title="Top vibes" items={analytics.topVibes.map((v) => ({ id: v.id, label: v.name, count: v.count }))} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Most popular listings (all-time)</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BarList
            title="Most liked"
            items={analytics.mostLiked.map((l) => ({ id: l.id, label: l.title, count: l.count }))}
            renderLabel={(item) => (
              <Link href={`/listing/${item.id}`} className="truncate underline hover:text-ink" title={item.label}>
                {item.label}
              </Link>
            )}
          />
          <BarList
            title="Most saved"
            items={analytics.mostSaved.map((l) => ({ id: l.id, label: l.title, count: l.count }))}
            renderLabel={(item) => (
              <Link href={`/listing/${item.id}`} className="truncate underline hover:text-ink" title={item.label}>
                {item.label}
              </Link>
            )}
          />
          <BarList
            title="Most messaged"
            items={analytics.mostMessaged.map((l) => ({ id: l.id, label: l.title, count: l.count }))}
            renderLabel={(item) => (
              <Link href={`/listing/${item.id}`} className="truncate underline hover:text-ink" title={item.label}>
                {item.label}
              </Link>
            )}
          />
        </div>
      </div>
    </div>
  );
}
