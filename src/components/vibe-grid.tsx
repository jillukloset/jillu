import Link from 'next/link';

const TILE_STYLES = [
  'bg-plum text-paper',
  'bg-ink text-paper',
  'bg-accent text-accent-ink',
  'bg-surface text-ink border border-border',
];

export function VibeGrid({ vibes }: { vibes: { name: string; slug: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {vibes.map((vibe, index) => (
        <Link
          key={vibe.slug}
          href={`/explore?vibe=${vibe.slug}`}
          className={`flex aspect-square flex-col items-center justify-center rounded-lg text-center font-display text-lg transition-transform hover:scale-[1.02] ${TILE_STYLES[index % TILE_STYLES.length]}`}
        >
          {vibe.name}
        </Link>
      ))}
    </div>
  );
}
