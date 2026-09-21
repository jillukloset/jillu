'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ALLOWED_IMAGE_TYPES, MAX_AVATAR_BYTES } from '@/lib/media-config';
import { Alert } from '@/components/ui/alert';

export function AvatarUploader({
  currentAvatarUrl,
  displayName,
}: {
  currentAvatarUrl: string | null;
  displayName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSelect = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError('Please choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('That image is too large (max 5MB).');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'avatars', contentType: file.type }),
      });
      const presignJson = await presignRes.json();
      if (!presignRes.ok || !presignJson.success) {
        throw new Error(presignJson.error?.message ?? 'Could not start upload.');
      }
      const { uploadUrl, objectKey } = presignJson.data;

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error('Upload failed. Please try again.');

      const confirmRes = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectKey }),
      });
      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok || !confirmJson.success) {
        throw new Error(confirmJson.error?.message ?? 'Could not save your photo.');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setPreview(currentAvatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative h-24 w-24 overflow-hidden rounded-full bg-plum transition-opacity hover:opacity-90"
        aria-label="Change profile photo"
      >
        {preview ? (
          <Image src={preview} alt={displayName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-paper">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40 text-xs text-paper">
            Uploading…
          </div>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-ink underline"
      >
        Change photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0])}
      />
      <Alert>{error}</Alert>
    </div>
  );
}
