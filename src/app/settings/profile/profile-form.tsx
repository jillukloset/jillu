'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

type FormValues = { displayName: string; bio: string; location: string };

export function ProfileForm({ initial }: { initial: FormValues }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: initial });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? 'Something went wrong. Please try again.');
      return;
    }
    setSaved(true);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Alert>{serverError}</Alert>
      {saved ? <Alert tone="success">Profile updated.</Alert> : null}

      <TextField
        label="Display name"
        error={errors.displayName?.message}
        {...register('displayName', { required: 'Enter a display name', maxLength: 50 })}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-semibold text-ink">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          placeholder="Tell people what your closet is about"
          {...register('bio', { maxLength: 280 })}
        />
        {errors.bio ? <p className="text-xs text-danger">{errors.bio.message}</p> : null}
      </div>
      <TextField label="Location" placeholder="City, state" {...register('location', { maxLength: 80 })} />

      <Button type="submit" loading={isSubmitting} className="mt-2 self-start">
        Save changes
      </Button>
    </form>
  );
}
