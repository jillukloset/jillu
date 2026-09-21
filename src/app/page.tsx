import Link from 'next/link';
import { buttonClassName } from '@/components/ui/button';
import { HomeSection } from '@/components/home-section';
import { ProductRow } from '@/components/product-row';
import { VibeGrid } from '@/components/vibe-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { getNewDrops, getTrending } from '@/modules/discovery/repository';
import { toListingCard } from '@/modules/listings/mappers';
import { listVibes } from '@/modules/taxonomy/repository';

export default async function HomePage() {
  const [newDrops, trending, vibes] = await Promise.all([getNewDrops(8), getTrending(8), listVibes()]);

  return (
    <div>
      <section className="relative overflow-hidden bg-plum px-gutter py-20 text-paper sm:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-paper/70">
            A closet for every story
          </p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            PRE-LOVED.
            <br />
            RE-LOVED.
          </h1>
          <p className="max-w-md text-lg text-paper/80">Discover pieces with another story.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/explore" className={buttonClassName('primary', 'lg', 'bg-accent text-accent-ink')}>
              EXPLORE
            </Link>
            <Link
              href="/sell"
              className={buttonClassName('secondary', 'lg', 'border-paper text-paper hover:bg-paper hover:text-plum')}
            >
              SELL SOMETHING
            </Link>
          </div>
        </div>
      </section>

      <HomeSection title="New drops" seeAllHref="/explore?sort=newest">
        {newDrops.length > 0 ? (
          <ProductRow listings={newDrops.map(toListingCard)} />
        ) : (
          <EmptyState title="Nothing new yet" description="Check back soon for fresh pieces." />
        )}
      </HomeSection>

      <HomeSection title="Trending" seeAllHref="/explore">
        {trending.length > 0 ? (
          <ProductRow listings={trending.map(toListingCard)} />
        ) : (
          <EmptyState title="Nothing trending yet" description="Popular pieces will show up here." />
        )}
      </HomeSection>

      <HomeSection title="Explore by vibe">
        <VibeGrid vibes={vibes} />
      </HomeSection>
    </div>
  );
}
