'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { ALLOWED_IMAGE_TYPES, MAX_LISTING_IMAGES, MAX_LISTING_IMAGE_BYTES, MIN_LISTING_IMAGES } from '@/lib/media-config';
import { XIcon } from '@/components/icons';
import { Alert } from '@/components/ui/alert';

export type PendingImage = {
  localId: string;
  previewUrl: string;
  objectKey: string | null;
  status: 'uploading' | 'done' | 'error';
};

export function ImageUploader({
  images,
  onChange,
}: {
  images: PendingImage[];
  onChange: (images: PendingImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const currentImagesRef = useRef(images);
  currentImagesRef.current = images;

  function patch(localId: string, changes: Partial<PendingImage>) {
    return currentImagesRef.current.map((img) => (img.localId === localId ? { ...img, ...changes } : img));
  }

  const uploadFile = async (file: File, localId: string) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      onChange(patch(localId, { status: 'error' }));
      setError(`${file.name} isn't a supported image type.`);
      return;
    }
    if (file.size > MAX_LISTING_IMAGE_BYTES) {
      onChange(patch(localId, { status: 'error' }));
      setError(`${file.name} is too large (max 8MB).`);
      return;
    }

    try {
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'listings', contentType: file.type }),
      });
      const presignJson = await presignRes.json();
      if (!presignRes.ok || !presignJson.success) throw new Error(presignJson.error?.message);
      const { uploadUrl, objectKey } = presignJson.data;

      const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putRes.ok) throw new Error('Upload failed');

      onChange(patch(localId, { status: 'done', objectKey }));
    } catch {
      onChange(patch(localId, { status: 'error' }));
      setError(`Couldn't upload ${file.name}. Please try again.`);
    }
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const room = MAX_LISTING_IMAGES - images.length;
    const selected = Array.from(files).slice(0, Math.max(room, 0));
    if (files.length > room) {
      setError(`You can add up to ${MAX_LISTING_IMAGES} photos.`);
    }

    const newEntries: PendingImage[] = selected.map((file) => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      objectKey: null,
      status: 'uploading',
    }));

    onChange([...images, ...newEntries]);
    newEntries.forEach((entry, i) => {
      const file = selected[i];
      if (file) uploadFile(file, entry.localId);
    });
  };

  const removeImage = (localId: string) => {
    onChange(images.filter((img) => img.localId !== localId));
  };

  const setPrimary = (localId: string) => {
    const target = images.find((img) => img.localId === localId);
    if (!target) return;
    const rest = images.filter((img) => img.localId !== localId);
    onChange([target, ...rest]);
  };

  const move = (localId: string, direction: -1 | 1) => {
    const index = images.findIndex((img) => img.localId === localId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= images.length) return;
    const copy = [...images];
    const temp = copy[index]!;
    copy[index] = copy[next]!;
    copy[next] = temp;
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, index) => (
          <div key={img.localId} className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-surface">
            <Image src={img.previewUrl} alt="" fill className="object-cover" unoptimized />
            {img.status === 'uploading' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/40 text-xs text-paper">
                Uploading…
              </div>
            ) : null}
            {img.status === 'error' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-danger/80 text-xs text-white">
                Failed
              </div>
            ) : null}

            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-pill bg-ink px-2 py-0.5 text-[10px] font-semibold text-paper">
                Cover
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => removeImage(img.localId)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-paper"
            >
              <XIcon width={14} height={14} />
            </button>

            <div className="absolute bottom-1.5 left-1.5 flex gap-1">
              {index !== 0 ? (
                <button
                  type="button"
                  onClick={() => setPrimary(img.localId)}
                  className="rounded-pill bg-surface/90 px-2 py-0.5 text-[10px] font-semibold text-ink"
                >
                  Make cover
                </button>
              ) : null}
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => move(img.localId, -1)}
                disabled={index === 0}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-surface/90 text-ink disabled:opacity-30"
                aria-label="Move earlier"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => move(img.localId, 1)}
                disabled={index === images.length - 1}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-surface/90 text-ink disabled:opacity-30"
                aria-label="Move later"
              >
                ›
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_LISTING_IMAGES ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={clsx(
              'flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink',
            )}
          >
            <span className="text-2xl leading-none">+</span>
            Add photo
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        {images.length}/{MAX_LISTING_IMAGES} photos · at least {MIN_LISTING_IMAGES} required. First photo is the cover.
      </p>

      <Alert>{error}</Alert>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
