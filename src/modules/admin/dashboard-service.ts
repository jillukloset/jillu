import { db } from '@/lib/db';

export async function getDashboardMetrics() {
  const [users, activeListings, soldListings, openReports, newReportsToday, activeConversations] =
    await Promise.all([
      db.user.count(),
      db.listing.count({ where: { status: 'ACTIVE' } }),
      db.listing.count({ where: { status: 'SOLD' } }),
      db.report.count({ where: { status: 'OPEN' } }),
      db.report.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      db.conversation.count(),
    ]);

  return { users, activeListings, soldListings, openReports, newReportsToday, activeConversations };
}
