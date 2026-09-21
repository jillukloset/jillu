'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';

type FormValues = { email: string };

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSubmitted(true);
  });

  if (submitted) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="font-display text-2xl">Check your inbox</p>
        <p className="text-sm text-muted">
          If an account exists for that email, we&rsquo;ve sent a link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="font-display text-2xl">Forgot password</h1>
      <p className="text-sm text-muted">
        Enter the email on your account and we&rsquo;ll send a link to reset your password.
      </p>
      <TextField
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Enter your email' })}
      />
      <Button type="submit" loading={isSubmitting}>
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-ink underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
