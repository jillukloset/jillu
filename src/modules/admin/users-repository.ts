import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export const ADMIN_USERS_PAGE_SIZE = 25;

// Every admin User query below uses an explicit `select` rather than the default
// "all scalar columns" behavior Prisma applies when only `include` is given for relations —
// otherwise `passwordHash` rides along into data handed to Client Components / audit metadata.
const adminUserSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  profile: { select: { username: true } },
} as const;

export function listUsers(
  filters: { search?: string; status?: string; role?: string },
  cursor?: string,
  take = ADMIN_USERS_PAGE_SIZE,
) {
  const where: Prisma.UserWhereInput = {};
  if (filters.status) where.status = filters.status as never;
  if (filters.role) where.role = filters.role as never;
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { profile: { username: { contains: filters.search, mode: 'insensitive' } } },
      { profile: { displayName: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  return db.user.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: adminUserSelect,
  });
}

export function findUserForAdmin(id: string) {
  return db.user.findUnique({
    where: { id },
    select: { ...adminUserSelect, _count: { select: { listings: true } } },
  });
}

export function setUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
  return db.user.update({ where: { id }, data: { status } });
}
