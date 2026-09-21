import type { Metadata } from 'next';
import { getDashboardMetrics } from '@/modules/admin/dashboard-service';

export const metadata: Metadata = { title: 'Admin dashboard — Jillu Kloset' };

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const cards = [
    { label: 'Users', value: metrics.users },
    { label: 'Active listings', value: metrics.activeListings },
    { label: 'Sold listings', value: metrics.soldListings },
    { label: 'Open reports', value: metrics.openReports },
    { label: 'New reports (24h)', value: metrics.newReportsToday },
    { label: 'Conversations', value: metrics.activeConversations },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
