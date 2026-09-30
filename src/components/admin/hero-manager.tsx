'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export type HeroConfigState = {
  isActive: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundUrl: string | null;
  backgroundObjectKey: string | null;
  backgroundColor: string;
  overlayOpacity: number;
  textAlign: 'left' | 'center';
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

const inputCls = 'w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm';
const labelCls = 'mb-1 block text-xs font-semibold text-slate-600';

export function HeroManager({ initial }: { initial: HeroConfigState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<HeroConfigState>(initial);
  const [saved, setSaved] = useState<HeroConfigState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = <K extends keyof HeroConfigState>(key: K, value: HeroConfigState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8 MB.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'hero', contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error('Presign failed');
      const presignJson = await presignRes.json();
      const { uploadUrl, objectKey, publicUrl } = presignJson.data;

      const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putRes.ok) throw new Error('Upload failed');

      setForm((f) => ({ ...f, backgroundObjectKey: objectKey, backgroundUrl: publicUrl }));
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    if (!dirty) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/admin/hero', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: form.isActive,
          eyebrow: form.eyebrow,
          title: form.title,
          subtitle: form.subtitle,
          backgroundColor: form.backgroundColor,
          overlayOpacity: form.overlayOpacity,
          textAlign: form.textAlign,
          primaryCtaLabel: form.primaryCtaLabel,
          primaryCtaHref: form.primaryCtaHref,
          secondaryCtaLabel: form.secondaryCtaLabel,
          secondaryCtaHref: form.secondaryCtaHref,
          backgroundObjectKey: form.backgroundObjectKey,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Save failed.');
        return;
      }
      const d = json.data;
      const next = {
        ...form,
        backgroundUrl: d.backgroundUrl ?? form.backgroundUrl,
        backgroundObjectKey: d.backgroundObjectKey ?? form.backgroundObjectKey,
      };
      setSaved(next);
      setForm(next);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <HeroPreview form={form} />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Hero status</p>
          <p className="text-xs text-slate-500">When disabled, the homepage shows no hero section.</p>
        </div>
        <button
          type="button"
          onClick={() => set('isActive', !form.isActive)}
          className={clsx(
            'relative h-6 w-11 rounded-full transition-colors',
            form.isActive ? 'bg-emerald-500' : 'bg-slate-300',
          )}
          role="switch"
          aria-checked={form.isActive}
        >
          <span
            className={clsx(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
              form.isActive ? 'left-[22px]' : 'left-0.5',
            )}
          />
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className={labelCls}>Background image</p>
        <div className="flex items-center gap-3">
          {form.backgroundUrl ? (
            <div className="relative h-16 w-28 overflow-hidden rounded-md border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.backgroundUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className="flex h-16 w-28 items-center justify-center rounded-md border border-slate-200 text-[10px] text-slate-400"
              style={{ backgroundColor: form.backgroundColor }}
            >
              Solid color
            </div>
          )}
          <div className="flex flex-col gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : form.backgroundUrl ? 'Replace image' : 'Upload image'}
            </button>
            {form.backgroundUrl ? (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, backgroundUrl: null, backgroundObjectKey: null }))}
                className="text-left text-xs text-red-600 underline"
              >
                Remove image
              </button>
            ) : null}
          </div>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          Recommended: 1920×800px or larger, max 8 MB. JPEG, PNG, or WebP.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Background color (used when no image)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.backgroundColor}
                onChange={(e) => set('backgroundColor', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-slate-300"
              />
              <input
                type="text"
                value={form.backgroundColor}
                onChange={(e) => set('backgroundColor', e.target.value)}
                className="w-24 rounded-md border border-slate-300 px-2 py-1 font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Image overlay darkness: {form.overlayOpacity}%</label>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={form.overlayOpacity}
              onChange={(e) => set('overlayOpacity', Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className={labelCls}>Text</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelCls}>Eyebrow (small line above title)</label>
            <input value={form.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} maxLength={80} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <textarea
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={120}
              rows={2}
              className={inputCls}
            />
            <p className="mt-0.5 text-[10px] text-slate-400">Use a line break for the two-line stacked look.</p>
          </div>
          <div>
            <label className={labelCls}>Subtitle</label>
            <textarea
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              maxLength={160}
              rows={2}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Text alignment</label>
            <div className="flex gap-2">
              {(['left', 'center'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => set('textAlign', align)}
                  className={clsx(
                    'rounded-md border px-4 py-1.5 text-xs font-semibold capitalize',
                    form.textAlign === align
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className={labelCls}>Call-to-action buttons</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Primary button label</label>
            <input value={form.primaryCtaLabel} onChange={(e) => set('primaryCtaLabel', e.target.value)} maxLength={30} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Primary button link</label>
            <input value={form.primaryCtaHref} onChange={(e) => set('primaryCtaHref', e.target.value)} maxLength={500} className={clsx(inputCls, 'font-mono text-xs')} />
          </div>
          <div>
            <label className={labelCls}>Secondary button label</label>
            <input value={form.secondaryCtaLabel} onChange={(e) => set('secondaryCtaLabel', e.target.value)} maxLength={30} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Secondary button link</label>
            <input value={form.secondaryCtaHref} onChange={(e) => set('secondaryCtaHref', e.target.value)} maxLength={500} className={clsx(inputCls, 'font-mono text-xs')} />
          </div>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">Links must start with “/” (site page) or “https://”.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={save}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        {dirty ? (
          <p className="text-xs text-amber-600">Unsaved changes</p>
        ) : (
          <p className="text-xs text-emerald-600">All changes saved</p>
        )}
      </div>
    </div>
  );
}

function HeroPreview({ form }: { form: HeroConfigState }) {
  const centered = form.textAlign === 'center';
  return (
    <div>
      <p className={labelCls}>Live preview</p>
      <div
        className="relative overflow-hidden rounded-lg border border-slate-300"
        style={{ backgroundColor: form.backgroundColor }}
      >
        {form.backgroundUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, rgba(23,19,16,${Math.min(form.overlayOpacity / 100 + 0.25, 1)}), rgba(23,19,16,${form.overlayOpacity / 100}) 55%, rgba(23,19,16,${Math.max(form.overlayOpacity / 100 - 0.15, 0)}))`,
              }}
            />
          </>
        ) : null}
        <div
          className={clsx(
            'relative flex flex-col gap-2 px-6 py-10 sm:py-14',
            centered ? 'items-center text-center' : 'items-start',
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-paper/70">
            {form.eyebrow || 'Eyebrow text'}
          </p>
          <p className="whitespace-pre-line font-display text-3xl leading-[0.95] tracking-tight text-paper sm:text-5xl">
            {form.title || 'Hero title'}
          </p>
          <p className="max-w-md text-sm text-paper/80">{form.subtitle || 'Hero subtitle'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-pill bg-accent px-5 py-2 text-xs font-semibold text-accent-ink">
              {form.primaryCtaLabel || 'Primary'}
            </span>
            <span className="rounded-pill border border-paper px-5 py-2 text-xs font-semibold text-paper">
              {form.secondaryCtaLabel || 'Secondary'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
