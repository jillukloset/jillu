import type { Metadata } from 'next';
import Link from 'next/link';
import { getOverviewMetrics } from '@/modules/analytics/overview-service';
import { getModerationSummary } from '@/modules/analytics/moderation-summary-service';
import { KpiCard } from '@/components/admin/analytics/kpi-card';

export const metadata: Metadata = { title: 'Admin dashboard — Jillu Kloset' };

export default async function AdminDashboardPage() {
  const [kpis, moderation] = await Promise.all([getOverviewMetrics(), getModerationSummary()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-1 text-xl font-semibold">Overview</h1>
        <p className="mb-6 text-sm text-slate-500">Business snapshot as of today, with week-over-week trends.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Moderation</h2>
          <Link href="/admin/reports" className="text-xs font-semibold text-slate-600 underline hover:text-ink">
            View all reports
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <ModerationTile label="Open reports" value={moderation.openReports} href="/admin/reports?status=OPEN" />
          <ModerationTile label="Counterfeit reports" value={moderation.counterfeitReports} href="/admin/reports" />
          <ModerationTile label="Scam reports" value={moderation.scamReports} href="/admin/reports" />
          <ModerationTile label="Suspended users" value={moderation.suspendedUsers} href="/admin/users?status=SUSPENDED" />
          <ModerationTile label="Removed listings" value={moderation.removedListings} href="/admin/listings" />
          <ModerationTile label="Audit log entries" value={moderation.auditLogEntries} href="/admin/audit" />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Analytics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AnalyticsLinkCard
            href="/admin/analytics/marketplace-health"
            title="Marketplace Health"
            description="Growth, engagement, and conversion trends over time."
          />
          <AnalyticsLinkCard
            href="/admin/analytics/users"
            title="User Analytics"
            description="New, active, and returning users, with date-range filtering."
          />
          <AnalyticsLinkCard
            href="/admin/analytics/listings"
            title="Listing Analytics"
            description="Inventory breakdown and top categories, brands, and listings."
          />
        </div>
      </div>
    </div>
  );
}

function ModerationTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
      <p className="text-lg font-semibold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Link>
  );
}

function AnalyticsLinkCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:shadow-sm"
    >
      <span className="text-sm font-semibold text-slate-900">{title}</span>
      <span className="text-xs text-slate-500">{description}</span>
    </Link>
  );
}
