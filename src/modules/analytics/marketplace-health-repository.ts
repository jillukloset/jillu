import { db } from '@/lib/db';
import type { DateRange } from './date-range';

export function newUsersDaily(range: DateRange) {
  return db.$queryRaw<{ bucket: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS bucket, count(*)::bigint AS count
    FROM "User"
    WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.end}
    GROUP BY 1 ORDER BY 1
  `;
}

export function newListingsDaily(range: DateRange) {
  return db.$queryRaw<{ bucket: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS bucket, count(*)::bigint AS count
    FROM "Listing"
    WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.end}
    GROUP BY 1 ORDER BY 1
  `;
}

export function soldListingsDaily(range: DateRange) {
  return db.$queryRaw<{ bucket: Date; count: bigint }[]>`
    SELECT date_trunc('day', "soldAt") AS bucket, count(*)::bigint AS count
    FROM "Listing"
    WHERE "soldAt" >= ${range.start} AND "soldAt" < ${range.end}
    GROUP BY 1 ORDER BY 1
  `;
}

/** Sellers who published or updated a listing within the window — the engagement proxy for "active". */
export async function countActiveSellers(range: DateRange) {
  const rows = await db.$queryRaw<{ count: bigint }[]>`
    SELECT count(DISTINCT "sellerId")::bigint AS count FROM "Listing"
    WHERE "updatedAt" >= ${range.start} AND "updatedAt" < ${range.end}
  `;
  return Number(rows[0]?.count ?? 0);
}

/** Buyers who started or continued a conversation within the window. */
export async function countActiveBuyers(range: DateRange) {
  const rows = await db.$queryRaw<{ count: bigint }[]>`
    SELECT count(DISTINCT "buyerId")::bigint AS count FROM "Conversation"
    WHERE "updatedAt" >= ${range.start} AND "updatedAt" < ${range.end}
  `;
  return Number(rows[0]?.count ?? 0);
}

export function countListingsCreatedInRange(range: DateRange) {
  return db.listing.count({ where: { createdAt: { gte: range.start, lt: range.end } } });
}

export function countListingsSoldInRange(range: DateRange) {
  return db.listing.count({ where: { soldAt: { gte: range.start, lt: range.end } } });
}

/** Of the listings created in the window, how many have received at least one conversation. */
export async function countListingsWithMessagesInRange(range: DateRange) {
  const rows = await db.$queryRaw<{ count: bigint }[]>`
    SELECT count(DISTINCT l.id)::bigint AS count
    FROM "Listing" l
    JOIN "Conversation" c ON c."listingId" = l.id
    WHERE l."createdAt" >= ${range.start} AND l."createdAt" < ${range.end}
  `;
  return Number(rows[0]?.count ?? 0);
}

/** Of the listings created in the window, how many are now SOLD. */
export function countListingsSoldFromCohort(range: DateRange) {
  return db.listing.count({ where: { createdAt: { gte: range.start, lt: range.end }, status: 'SOLD' } });
}

export function countReportsInRange(range: DateRange) {
  return db.report.count({ where: { createdAt: { gte: range.start, lt: range.end } } });
}

export function countActiveListingsSnapshot() {
  return db.listing.count({ where: { status: 'ACTIVE' } });
}
