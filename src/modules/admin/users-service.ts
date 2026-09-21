import { AppError } from '@/lib/api-result';
import { recordAuditLog } from './audit';
import { ADMIN_USERS_PAGE_SIZE, findUserForAdmin, listUsers, setUserStatus } from './users-repository';

export async function getUsersPage(
  filters: { search?: string; status?: string; role?: string },
  cursor?: string,
) {
  const rows = await listUsers(filters, cursor);
  const hasMore = rows.length > ADMIN_USERS_PAGE_SIZE;
  return { items: rows.slice(0, ADMIN_USERS_PAGE_SIZE), hasMore };
}

export async function suspendUser(adminId: string, targetUserId: string) {
  if (adminId === targetUserId) {
    throw new AppError('CANNOT_SUSPEND_SELF', 'You cannot suspend your own account.');
  }
  const target = await findUserForAdmin(targetUserId);
  if (!target) throw new AppError('USER_NOT_FOUND', 'That user does not exist.', 404);
  if (target.role === 'ADMIN') {
    throw new AppError('CANNOT_SUSPEND_ADMIN', 'You cannot suspend another admin.');
  }

  const updated = await setUserStatus(targetUserId, 'SUSPENDED');
  await recordAuditLog(adminId, 'USER_SUSPENDED', 'USER', targetUserId, { email: target.email });
  return updated;
}

export async function restoreUser(adminId: string, targetUserId: string) {
  const target = await findUserForAdmin(targetUserId);
  if (!target) throw new AppError('USER_NOT_FOUND', 'That user does not exist.', 404);

  const updated = await setUserStatus(targetUserId, 'ACTIVE');
  await recordAuditLog(adminId, 'USER_RESTORED', 'USER', targetUserId, { email: target.email });
  return updated;
}
