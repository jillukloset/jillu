'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ImageUploader, type PendingImage } from '@/components/listing/image-uploader';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { conditionLabel } from '@/components/condition-badge';
import { Price } from '@/components/ui/price';
import { MIN_LISTING_IMAGES } from '@/lib/media-config';

type Taxonomy = { id: string; name: string }[];

type DetailsForm = {
  title: string;
  description: string;
  categoryId: string;
  brandId: string;
  size: string;
  condition: string;
  gender: string;
  color: string;
  price: string;
  location: string;
  vibeIds: string[];
};

const CONDITIONS = ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'VISIBLE_WEAR'];
const GENDERS = ['WOMEN', 'MEN', 'UNISEX'];
const STEPS = ['Photos', 'Details', 'Preview'] as const;

export type ExistingListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  brandId: string | null;
  size: string;
  condition: string;
  gender: string;
  color: string | null;
  location: string;
  vibes: { vibe: { id: string } }[];
  images: { url: string; objectKey: string }[];
};

export function SellWizard({
  categories,
  brands,
  vibes,
  existingListing,
}: {
  categories: Taxonomy;
  brands: Taxonomy;
  vibes: Taxonomy;
  existingListing?: ExistingListing;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<PendingImage[]>(
    existingListing
      ? existingListing.images.map((image) => ({
          localId: image.objectKey,
          previewUrl: image.url,
          objectKey: image.objectKey,
          status: 'done' as const,
        }))
      : [],
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null);
  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = useForm<DetailsForm>({
    defaultValues: existingListing
      ? {
          title: existingListing.title,
          description: existingListing.description,
          categoryId: existingListing.categoryId,
          brandId: existingListing.brandId ?? '',
          size: existingListing.size,
          condition: existingListing.condition,
          gender: existingListing.gender,
          color: existingListing.color ?? '',
          price: String(existingListing.price),
          location: existingListing.location,
          vibeIds: existingListing.vibes.map((v) => v.vibe.id),
        }
      : {
          title: '',
          description: '',
          categoryId: '',
          brandId: '',
          size: '',
          condition: 'GOOD',
          gender: 'UNISEX',
          color: '',
          price: '',
          location: '',
          vibeIds: [],
        },
  });

  const values = watch();
  const readyImages = images.filter((img) => img.status === 'done');
  const canProceedFromPhotos = readyImages.length >= MIN_LISTING_IMAGES;

  const goNext = async () => {
    if (step === 0) {
      if (!canProceedFromPhotos) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const valid = await trigger(['title', 'description', 'categoryId', 'size', 'price', 'location']);
      if (!valid) return;
      setStep(2);
    }
  };

  const submit = async (status: 'DRAFT' | 'ACTIVE') => {
    setServerError(null);
    setSubmitting(status === 'DRAFT' ? 'draft' : 'publish');

    const payload = {
      status,
      title: values.title,
      description: values.description,
      price: Number(values.price),
      categoryId: values.categoryId,
      brandId: values.brandId || undefined,
      size: values.size,
      condition: values.condition,
      gender: values.gender,
      color: values.color || undefined,
      location: values.location,
      vibeIds: values.vibeIds,
      images: readyImages.map((img, index) => ({
        objectKey: img.objectKey!,
        order: index,
        isPrimary: index === 0,
      })),
    };

    const url = existingListing ? `/api/listings/${existingListing.id}` : '/api/listings';
    const method = existingListing ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSubmitting(null);

    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? 'Something went wrong. Please try again.');
      return;
    }

    if (status === 'ACTIVE') {
      router.push(`/listing/${json.data.id}`);
    } else {
      router.push('/seller');
    }
    router.refresh();
  };

  return (
    <div>
      <ol className="mb-8 flex gap-4 text-sm font-semibold text-muted">
        {STEPS.map((label, index) => (
          <li key={label} className={clsx(index === step && 'text-ink')}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <ImageUploader images={images} onChange={setImages} />
          <Button type="button" onClick={goNext} disabled={!canProceedFromPhotos} className="self-end">
            Next
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()} noValidate>
          <TextField label="Title" error={errors.title?.message} {...register('title', { required: 'Enter a title' })} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-ink">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={clsx(
                'rounded-md border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none',
                errors.description ? 'border-danger' : 'border-border focus:border-ink',
              )}
              {...register('description', { required: 'Add a description', minLength: 10 })}
            />
            {errors.description ? (
              <p id="description-error" role="alert" className="text-xs text-danger">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Category" error={errors.categoryId?.message} {...register('categoryId', { required: 'Choose a category' })}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>

            <SelectField label="Brand (optional)" {...register('brandId')}>
              <option value="">None / unbranded</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Size" error={errors.size?.message} {...register('size', { required: 'Enter a size' })} />
            <SelectField label="Condition" {...register('condition')}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {conditionLabel(c)}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Gender" {...register('gender')}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g[0]}
                  {g.slice(1).toLowerCase()}
                </option>
              ))}
            </SelectField>
            <TextField label="Color (optional)" {...register('color')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Price (INR)"
              type="number"
              min={1}
              error={errors.price?.message}
              {...register('price', { required: 'Enter a price', min: { value: 1, message: 'Enter a price' } })}
            />
            <TextField label="Location" error={errors.location?.message} {...register('location', { required: 'Enter a location' })} />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">Vibes (optional, up to 6)</legend>
            <div className="flex flex-wrap gap-2">
              {vibes.map((vibe) => (
                <label
                  key={vibe.id}
                  className="flex cursor-pointer items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-xs font-medium has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
                >
                  <input type="checkbox" value={vibe.id} className="sr-only" {...register('vibeIds')} />
                  {vibe.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="button" onClick={goNext}>
              Preview
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <Alert>{serverError}</Alert>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {readyImages[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={readyImages[0].previewUrl} alt="" className="aspect-[4/5] w-full object-cover" />
            ) : null}
            <div className="flex flex-col gap-1 p-4">
              <p className="font-display text-xl">{values.title}</p>
              <Price amount={Number(values.price) || 0} className="text-lg font-semibold" />
              <p className="text-sm text-muted">
                {conditionLabel(values.condition)} · Size {values.size} · {values.location}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-ink">{values.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                loading={submitting === 'draft'}
                disabled={submitting !== null}
                onClick={() => submit('DRAFT')}
              >
                Save as draft
              </Button>
              <Button type="button" loading={submitting === 'publish'} disabled={submitting !== null} onClick={() => submit('ACTIVE')}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const fieldId = props.name;
  const errorId = fieldId ? `${fieldId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={clsx(
          'rounded-md border bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none',
          error ? 'border-danger' : 'border-border focus:border-ink',
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
