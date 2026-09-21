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
    <section className="px-gutter py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-xl sm:text-2xl">{title}</h2>
          {seeAllHref ? (
            <Link href={seeAllHref} className="text-xs font-semibold uppercase tracking-wide text-muted hover:text-ink">
              See all
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
