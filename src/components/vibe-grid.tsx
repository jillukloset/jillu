import Link from 'next/link';

const FALLBACK_STYLES = [
  'bg-plum text-paper',
  'bg-ink text-paper',
  'bg-accent text-accent-ink',
  'bg-surface text-ink border border-border',
];

type VibeItem = {
  name: string;
  slug: string;
  bannerUrl: string | null;
  description: string | null;
  accentColor: string | null;
};

export function VibeGrid({ vibes }: { vibes: VibeItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {vibes.map((vibe, index) => {
        const fallbackStyle = FALLBACK_STYLES[index % FALLBACK_STYLES.length];
        const hasBanner = Boolean(vibe.bannerUrl);

        return (
          <Link
            key={vibe.slug}
            href={`/explore?vibe=${vibe.slug}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
            style={!hasBanner && vibe.accentColor ? { backgroundColor: vibe.accentColor } : undefined}
          >
            {hasBanner ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vibe.bannerUrl!}
                  alt={vibe.name}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </>
            ) : (
              <div className={`absolute inset-0 ${fallbackStyle}`} />
            )}

            <div className="relative z-10 flex flex-col gap-1 p-4">
              <p className={`font-display text-lg leading-tight ${hasBanner ? 'text-white' : ''}`}>
                {vibe.name}
              </p>
              {vibe.description ? (
                <p className={`line-clamp-2 text-xs leading-snug ${hasBanner ? 'text-white/80' : 'text-inherit opacity-70'}`}>
                  {vibe.description}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
