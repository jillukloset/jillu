import { db } from '@/lib/db';

const DAY_MS = 24 * 60 * 60 * 1000;

export function windowBounds(days: number) {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const start = new Date(end.getTime() - days * DAY_MS);
  const previousStart = new Date(start.getTime() - days * DAY_MS);
  return { start, end, previousStart };
}

export function countTotalUsers() {
  return db.user.count();
}

export async function countActiveSellers() {
  const rows = await db.$queryRaw<{ count: bigint }[]>`
    SELECT count(DISTINCT "sellerId")::bigint AS count FROM "Listing" WHERE status = 'ACTIVE'
  `;
  return Number(rows[0]?.count ?? 0);
}

export function countActiveListings() {
  return db.listing.count({ where: { status: 'ACTIVE' } });
}

export function countListingsCreatedBetween(start: Date, end: Date) {
  return db.listing.count({ where: { createdAt: { gte: start, lt: end } } });
}

export function countListingsSoldBetween(start: Date, end: Date) {
  return db.listing.count({ where: { soldAt: { gte: start, lt: end } } });
}

export function countOpenReports() {
  return db.report.count({ where: { status: { in: ['OPEN', 'REVIEWING'] } } });
}

export function countReportsCreatedBetween(start: Date, end: Date) {
  return db.report.count({ where: { createdAt: { gte: start, lt: end } } });
}

export function countNewUsersBetween(start: Date, end: Date) {
  return db.user.count({ where: { createdAt: { gte: start, lt: end } } });
}
