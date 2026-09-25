import { db } from '@/lib/db';
import type { DateRange } from './date-range';

export function countTotalUsers() {
  return db.user.count();
}

export function countNewUsersInRange(range: DateRange) {
  return db.user.count({ where: { createdAt: { gte: range.start, lt: range.end } } });
}

export function countSuspendedUsers() {
  return db.user.count({ where: { status: 'SUSPENDED' } });
}

/** Sellers whose very first listing falls inside the window. */
export async function countNewSellersInRange(range: DateRange) {
  const rows = await db.$queryRaw<{ count: bigint }[]>`
    SELECT count(*)::bigint AS count FROM (
      SELECT "sellerId" FROM "Listing"
      GROUP BY "sellerId"
      HAVING min("createdAt") >= ${range.start} AND min("createdAt") < ${range.end}
    ) AS first_listing
  `;
  return Number(rows[0]?.count ?? 0);
}

/**
 * "Active" has no dedicated session/last-seen tracking in this app (JWT sessions, no
 * per-request DB write) — defined instead as an engagement proxy: a user who created or
 * updated a listing, started/continued a conversation, sent a message, liked, saved, or
 * followed something within the window. "Returning" narrows that to users whose account
 * predates the window (i.e. not a brand-new signup being active on day one).
 *
 * This touches several tables via unindexed date-range scans (Listing.updatedAt,
 * Message.createdAt, etc.) rather than adding an index per table — deliberately: this is
 * an admin-only, infrequently-viewed report against tables that aren't yet large enough
 * for that to matter, so the extra write-amplification of more indexes isn't justified
 * (see the Phase 8 principle: don't index queries that don't need it yet).
 */
export async function activeAndReturningUsers(range: DateRange) {
  const rows = await db.$queryRaw<{ total_active: bigint; returning: bigint }[]>`
    WITH active AS (
      SELECT "sellerId" AS uid FROM "Listing" WHERE "updatedAt" >= ${range.start} AND "updatedAt" < ${range.end}
      UNION
      SELECT "buyerId" FROM "Conversation" WHERE "updatedAt" >= ${range.start} AND "updatedAt" < ${range.end}
      UNION
      SELECT "sellerId" FROM "Conversation" WHERE "updatedAt" >= ${range.start} AND "updatedAt" < ${range.end}
      UNION
      SELECT "senderId" FROM "Message" WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.end}
      UNION
      SELECT "userId" FROM "Like" WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.end}
      UNION
      SELECT "userId" FROM "Save" WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.end}
      UNION
      SELECT "followerId" FROM "Follow" WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.end}
    )
    SELECT
      count(*)::bigint AS total_active,
      count(*) FILTER (WHERE u."createdAt" < ${range.start})::bigint AS returning
    FROM active a JOIN "User" u ON u.id = a.uid
  `;
  const row = rows[0];
  return { activeUsers: Number(row?.total_active ?? 0), returningUsers: Number(row?.returning ?? 0) };
}
