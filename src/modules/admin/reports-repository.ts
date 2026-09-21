import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export const ADMIN_REPORTS_PAGE_SIZE = 25;

// User relations must use an explicit `select`, never a bare `include` — Prisma otherwise
// serializes every column on that model, including `passwordHash`, into the JSON response.
const usernameOnlySelect = { select: { profile: { select: { username: true } } } };
const moderationTargetSelect = { select: { id: true, status: true, role: true, profile: { select: { username: true } } } };

const reportInclude = {
  reporter: usernameOnlySelect,
  listing: {
    include: {
      images: { orderBy: { order: 'asc' as const }, take: 1 },
      seller: moderationTargetSelect,
    },
  },
  targetUser: moderationTargetSelect,
};

export function listReportsForAdmin(
  filters: { status?: string; targetType?: string },
  cursor?: string,
  take = ADMIN_REPORTS_PAGE_SIZE,
) {
  const where: Prisma.ReportWhereInput = {};
  if (filters.status) where.status = filters.status as never;
  if (filters.targetType) where.targetType = filters.targetType as never;

  return db.report.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: reportInclude,
  });
}

export function findReportById(id: string) {
  return db.report.findUnique({ where: { id }, include: reportInclude });
}

export function updateReportStatus(id: string, status: string, adminNote?: string) {
  return db.report.update({
    where: { id },
    data: {
      status: status as never,
      adminNote,
      reviewedAt: new Date(),
    },
  });
}
