'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

type FormValues = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? 'Something went wrong. Please try again.');
      return;
    }
    setSubmitted(true);
    router.refresh();
  });

  if (submitted) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="font-display text-2xl">Check your inbox</p>
        <p className="text-sm text-muted">
          We sent a verification link to confirm your account. Open it to activate your closet.
        </p>
        <p className="text-xs text-muted">Verification email sent. Please check your inbox.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="font-display text-2xl">Create your closet</h1>
      <Alert>{serverError}</Alert>

      <TextField
        label="Display name"
        error={errors.displayName?.message}
        {...register('displayName', { required: 'Enter a display name', maxLength: 50 })}
      />
      <TextField
        label="Username"
        error={errors.username?.message}
        hint="jillukloset.com/closet/your-username"
        {...register('username', {
          required: 'Choose a username',
          pattern: { value: /^[a-z0-9_.]{3,24}$/, message: '3-24 lowercase letters, numbers, dots or _' },
        })}
      />
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
        {...register('password', {
          required: 'Choose a password',
          minLength: { value: 8, message: 'At least 8 characters' },
        })}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Create account
      </Button>

      <p className="text-center text-sm text-muted">
        Already on Jillu?{' '}
        <Link href="/login" className="font-semibold text-ink underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
