import Link from 'next/link';

export function HomeSection({
  title,
  seeAllHref,
  children,
}: {
  title: string;
  seeAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-gutter py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
          <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">{title}</h2>
          {seeAllHref ? (
            <Link
              href={seeAllHref}
              className="shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent-text"
            >
              See all →
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
