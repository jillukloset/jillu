import { auth } from '@/auth';
import { AppError } from '@/lib/api-result';

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new AppError('UNAUTHORIZED', 'You need to be logged in to do that.', 401);
  }
  return session;
}
