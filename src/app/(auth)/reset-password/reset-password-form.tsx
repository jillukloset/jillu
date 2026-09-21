'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

type FormValues = { password: string };

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: values.password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? 'Something went wrong. Please try again.');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/login'), 1500);
  });

  if (done) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="font-display text-2xl">Password updated</p>
        <p className="text-sm text-muted">Taking you to log in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="font-display text-2xl">Set a new password</h1>
      <Alert>{serverError}</Alert>
      <TextField
        label="New password"
        type="password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Choose a password',
          minLength: { value: 8, message: 'At least 8 characters' },
        })}
      />
      <Button type="submit" loading={isSubmitting}>
        Reset password
      </Button>
    </form>
  );
}
