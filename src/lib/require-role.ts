import { notFound, redirect } from 'next/navigation';
import { AppError } from '@/lib/api-result';
import { auth } from '@/auth';
import { requireSession } from '@/lib/current-user';

const MODERATOR_ROLES = ['MODERATOR', 'ADMIN'];

export async function requireModerator() {
  const session = await requireSession();
  if (!MODERATOR_ROLES.includes(session.user.role)) {
    throw new AppError('FORBIDDEN', 'You do not have permission to do that.', 403);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'You do not have permission to do that.', 403);
  }
  return session;
}

/** For Server Component pages that are ADMIN-only: redirects/404s instead of throwing. */
export async function requireAdminPage(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (session.user.role !== 'ADMIN') notFound();
  return session;
}
