'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type VibeEntry = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  bannerUrl: string | null;
  bannerObjectKey: string | null;
  description: string | null;
  accentColor: string | null;
};

const PRESET_COLORS = [
  '#4A1942', '#2D2D2D', '#C9ADA7', '#9A8C98',
  '#F2E9E4', '#5F7470', '#B8001F', '#FF6F00',
  '#004E64', '#256D7B', '#7B2D8E', '#1A535C',
];

const FALLBACK_STYLES = [
  'bg-plum text-paper',
  'bg-ink text-paper',
  'bg-accent text-accent-ink',
  'bg-surface text-ink border border-border',
];

export function VibeManager({ entries }: { entries: VibeEntry[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const call = (fn: () => Promise<Response>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Action failed.');
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  const create = () => {
    if (!newName.trim()) return;
    call(() =>
      fetch('/api/admin/taxonomy/vibes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      }),
    );
    setNewName('');
  };

  const rename = (id: string, currentName: string) => {
    const name = prompt('Rename vibe:', currentName);
    if (!name?.trim() || name.trim() === currentName) return;
    call(() =>
      fetch(`/api/admin/taxonomy/vibes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      }),
    );
  };

  const toggle = (id: string, isActive: boolean) => {
    call(() =>
      fetch(`/api/admin/taxonomy/vibes/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      }),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New vibe name…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={pending}
          onClick={create}
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add vibe
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No vibes yet. Create one above.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <VibeCard
              key={entry.id}
              entry={entry}
              index={index}
              expanded={expandedId === entry.id}
              pending={pending}
              onToggleExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              onRename={() => rename(entry.id, entry.name)}
              onToggle={() => toggle(entry.id, entry.isActive)}
              onUpdate={(data, done) =>
                call(
                  () =>
                    fetch(`/api/admin/vibes/${entry.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    }),
                  done,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VibeCard({
  entry,
  index,
  expanded,
  pending,
  onToggleExpand,
  onRename,
  onToggle,
  onUpdate,
}: {
  entry: VibeEntry;
  index: number;
  expanded: boolean;
  pending: boolean;
  onToggleExpand: () => void;
  onRename: () => void;
  onToggle: () => void;
  onUpdate: (data: Record<string, unknown>, done?: () => void) => void;
}) {
  const [description, setDescription] = useState(entry.description ?? '');
  const [accentColor, setAccentColor] = useState(entry.accentColor ?? PRESET_COLORS[index % PRESET_COLORS.length]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(entry.bannerUrl);
  const [bannerKey, setBannerKey] = useState<string | null>(entry.bannerObjectKey);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    setUploading(true);
    try {
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'vibes', contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error('Presign failed');
      const presignJson = await presignRes.json();
      const { uploadUrl, objectKey, publicUrl } = presignJson.data;

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error('Upload failed');

      setBannerPreview(publicUrl);
      setBannerKey(objectKey);
      setDirty(true);
    } catch {
      alert('Banner upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeBanner = () => {
    setBannerPreview(null);
    setBannerKey(null);
    setDirty(true);
  };

  const save = () => {
    onUpdate(
      {
        description: description.trim() || null,
        accentColor,
        bannerObjectKey: bannerKey,
      },
      () => setDirty(false),
    );
  };

  const fallbackStyle = FALLBACK_STYLES[index % FALLBACK_STYLES.length];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className={`relative flex aspect-[16/10] items-end justify-center ${bannerPreview ? '' : fallbackStyle}`}
        style={!bannerPreview && entry.accentColor ? { backgroundColor: entry.accentColor } : undefined}
      >
        {bannerPreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : null}
        <p className={`relative z-10 pb-3 text-center font-display text-xl ${bannerPreview ? 'text-white' : ''}`}>
          {entry.name}
        </p>
        {!entry.isActive ? (
          <span className="absolute right-2 top-2 rounded-pill bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            Disabled
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-xs font-semibold text-slate-700 underline"
        >
          {expanded ? 'Close' : 'Edit'}
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onRename} className="text-xs font-semibold text-slate-700 underline">
            Rename
          </button>
          <button type="button" onClick={onToggle} disabled={pending} className="text-xs font-semibold text-slate-700 underline">
            {entry.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 px-3 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Banner image</label>
            <div className="flex items-center gap-3">
              {bannerPreview ? (
                <div className="relative h-16 w-24 overflow-hidden rounded-md border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBannerUpload(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : bannerPreview ? 'Replace banner' : 'Upload banner'}
                </button>
                {bannerPreview ? (
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="text-left text-xs text-red-600 underline"
                  >
                    Remove banner
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Recommended: 800×500px, max 5 MB. JPEG, PNG, or WebP.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
              placeholder="A short description for this vibe…"
              maxLength={200}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
            <p className="mt-0.5 text-right text-[10px] text-slate-400">{description.length}/200</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Accent color</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setAccentColor(color); setDirty(true); }}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${accentColor === color ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => { setAccentColor(e.target.value); setDirty(true); }}
                className="h-7 w-7 cursor-pointer rounded border border-slate-300"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => { setAccentColor(e.target.value); setDirty(true); }}
                className="w-24 rounded-md border border-slate-300 px-2 py-1 font-mono text-xs"
                placeholder="#FF5733"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={!dirty || pending}
              onClick={save}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              Save changes
            </button>
            {dirty ? (
              <p className="text-[10px] text-amber-600">Unsaved changes</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
