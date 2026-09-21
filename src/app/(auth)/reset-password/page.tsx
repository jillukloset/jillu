import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Reset password — Jillu Kloset' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-display text-2xl">Missing token</p>
        <p className="text-sm text-muted">This reset link is incomplete. Request a new one.</p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
