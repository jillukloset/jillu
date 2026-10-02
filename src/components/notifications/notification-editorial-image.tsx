import clsx from 'clsx';
import { TapeStrip } from './notification-doodles';

export type EditorialImageVariant = 'polaroid' | 'taped' | 'bare' | 'full';

/**
 * Reusable editorial image slot for the notifications page collage.
 *
 * The `slot` name identifies the position so the real Jillu fashion
 * photography can be dropped in later — pass `src` (and optionally `alt`)
 * and the slot renders the photo in the chosen frame style. Until then it
 * renders a labelled placeholder so the composition stays intact.
 *
 * Named slots used on this page:
 *  - 'left-editorial'  — tall polaroid, left column ("PRE-LOVED. RE-LOVED.")
 *  - 'right-loop'      — taped photo under "STAY IN THE LOOP", right column
 *  - 'right-collage'   — taped "JILLU KLOSET" photo, right column
 *
 * `variant="full"` is for a pre-composed collage image (doodles/tape/captions already baked
 * into the asset) that must render whole, at its own natural aspect ratio — no cropping to
 * 4:5, no extra polaroid frame or caption layered on top.
 */
export function NotificationEditorialImage({
  slot,
  src,
  alt = '',
  caption,
  variant = 'polaroid',
  rotate = 0,
  className,
}: {
  slot: string;
  src?: string | null;
  alt?: string;
  caption?: string;
  variant?: EditorialImageVariant;
  rotate?: number;
  className?: string;
}) {
  return (
    <figure className={clsx('relative', className)} style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
      {variant === 'taped' ? (
        <>
          <TapeStrip className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
          <TapeStrip className="-bottom-3 right-2 rotate-6 w-16" />
        </>
      ) : null}

      {src && variant === 'full' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full rounded-lg shadow-card" />
      ) : src ? (
        <div
          className={clsx(
            'overflow-hidden',
            variant === 'bare' ? 'rounded-md' : 'bg-surface p-2 pb-3 shadow-card',
          )}
        >
          {/* Native img on purpose: slots must accept any future Jillu photography host without next.config changes. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className={clsx('w-full object-cover', variant === 'bare' ? 'aspect-[4/5] rounded-md' : 'aspect-[4/5]')} />
        </div>
      ) : (
        <div
          className={clsx(
            'flex aspect-[4/5] flex-col items-center justify-center gap-2 border-2 border-dashed border-plum/25 bg-surface/70 text-center',
            variant === 'bare' ? 'rounded-md' : 'bg-surface p-2 pb-3 shadow-card',
          )}
        >
          <span className="font-display text-2xl italic text-plum/50">J</span>
          <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Fashion photo slot
          </span>
          <span className="px-3 font-mono text-[10px] text-plum/60">slot: {slot}</span>
        </div>
      )}

      {variant === 'polaroid' && caption ? (
        <figcaption className="mt-2 text-center font-hand text-lg leading-tight text-ink">{caption}</figcaption>
      ) : null}
      {variant === 'taped' && caption ? (
        <figcaption className="mt-3 -rotate-2 text-center font-hand text-xl leading-tight text-ink">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
