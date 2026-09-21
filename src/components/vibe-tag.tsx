import Link from 'next/link';

export function VibeTag({ name, slug }: { name: string; slug?: string }) {
  const content = (
    <span className="inline-flex items-center rounded-pill bg-plum px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-paper">
      {name}
    </span>
  );
  return slug ? <Link href={`/explore?vibe=${slug}`}>{content}</Link> : content;
}
