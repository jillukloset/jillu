import Link from 'next/link';
import clsx from 'clsx';
import { buttonClassName } from '@/components/ui/button';
import type { HeroConfigState } from '@/components/admin/hero-manager';

type HeroConfigInput = Omit<HeroConfigState, 'textAlign'> & { textAlign: string };

export function Hero({ config }: { config: HeroConfigInput | null }) {
  if (config && !config.isActive) return null;

  const c = config ?? {
    isActive: true,
    eyebrow: 'A closet for every story',
    title: 'PRE-LOVED.\nRE-LOVED.',
    subtitle: 'Discover pieces with another story.',
    backgroundUrl: null,
    backgroundObjectKey: null,
    backgroundColor: '#3B2230',
    overlayOpacity: 35,
    textAlign: 'left' as const,
    primaryCtaLabel: 'EXPLORE',
    primaryCtaHref: '/explore',
    secondaryCtaLabel: 'SELL SOMETHING',
    secondaryCtaHref: '/sell',
  };

  const centered = c.textAlign === 'center';
  const overlay = c.overlayOpacity / 100;

  return (
    <section
      className="relative overflow-hidden px-gutter py-24 text-paper sm:py-32"
      style={{ backgroundColor: c.backgroundColor }}
    >
      {c.backgroundUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(23,19,16,${Math.min(overlay + 0.25, 1)}), rgba(23,19,16,${overlay}) 55%, rgba(23,19,16,${Math.max(overlay - 0.15, 0)}))`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 140% at 15% 0%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(90% 120% at 100% 100%, rgba(0,0,0,0.25), transparent 60%)',
          }}
        />
      )}

      <div
        className={clsx(
          'relative mx-auto flex max-w-5xl flex-col gap-7 motion-safe:animate-[fade-in-up_0.7s_ease-out]',
          centered ? 'items-center text-center' : 'items-start',
        )}
      >
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-paper/70">
          <span className="h-px w-8 bg-paper/40" aria-hidden />
          {c.eyebrow}
        </p>
        <h1 className="whitespace-pre-line font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          {c.title}
        </h1>
        <p className="max-w-md text-lg text-paper/80">{c.subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={c.primaryCtaHref} className={buttonClassName('primary', 'lg', 'bg-accent text-accent-ink')}>
            {c.primaryCtaLabel}
          </Link>
          <Link
            href={c.secondaryCtaHref}
            className={buttonClassName('secondary', 'lg', 'border-paper text-paper hover:bg-paper hover:text-plum')}
          >
            {c.secondaryCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
