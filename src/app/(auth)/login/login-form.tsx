'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getProviders, signIn } from 'next-auth/react';
import Link from 'next/link';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { safeRedirectPath } from '@/lib/safe-redirect';

type FormValues = { email: string; password: string };

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Incorrect email or password.',
  EmailNotVerified: 'Please verify your email before logging in. Check your inbox for the link.',
  AccountSuspended: 'This account has been suspended. Contact support for help.',
  RateLimited: 'Too many login attempts. Please wait a few minutes and try again.',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeRedirectPath(searchParams.get('callbackUrl'));
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    getProviders().then((providers) => setGoogleEnabled(Boolean(providers?.google)));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError(ERROR_MESSAGES[result.error] ?? 'Incorrect email or password.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="font-display text-2xl">Welcome back</h1>
      <Alert>{serverError}</Alert>

      <TextField
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Enter your email' })}
      />
      <TextField
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password', { required: 'Enter your password' })}
      />

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs font-medium text-muted underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} className="mt-1">
        Log in
      </Button>

      {googleEnabled ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => signIn('google', { callbackUrl })}
        >
          Continue with Google
        </Button>
      ) : null}

      <p className="text-center text-sm text-muted">
        New to Jillu?{' '}
        <Link href="/signup" className="font-semibold text-ink underline">
          Create your closet
        </Link>
      </p>
    </form>
  );
}
