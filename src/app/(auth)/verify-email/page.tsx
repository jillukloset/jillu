import Link from 'next/link';
import type { Metadata } from 'next';
import { verifyEmail } from '@/modules/auth/service';
import { AppError } from '@/lib/api-result';
import { buttonClassName } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Verify email — Jillu Kloset' };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <Result title="Missing token" message="This verification link is incomplete." />;
  }

  try {
    await verifyEmail(token);
    return (
      <Result title="Email verified" message="Your account is ready. Welcome to Jillu Kloset.">
        <Link href="/login" className={buttonClassName('primary', 'md', 'mt-2')}>
          Log in
        </Link>
      </Result>
    );
  } catch (error) {
    const message =
      error instanceof AppError ? error.message : 'This verification link is invalid or has expired.';
    return <Result title="Verification failed" message={message} />;
  }
}

function Result({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-display text-2xl">{title}</p>
      <p className="text-sm text-muted">{message}</p>
      {children}
    </div>
  );
}
