import { HomeSection } from '@/components/home-section';
import { ProductRow } from '@/components/product-row';
import { Hero } from '@/components/hero';
import { OpenClosetSection } from '@/components/open-closet-section';
import { VibeGrid } from '@/components/vibe-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { auth } from '@/auth';
import { getNewDrops, getTrending } from '@/modules/discovery/repository';
import { toListingCard } from '@/modules/listings/mappers';
import { listVibes } from '@/modules/taxonomy/repository';
import { getHeroConfig } from '@/modules/admin/hero-service';

export default async function HomePage() {
  const [newDrops, trending, vibes, heroConfig, session] = await Promise.all([
    getNewDrops(8),
    getTrending(8),
    listVibes(),
    getHeroConfig(),
    auth(),
  ]);

  const closetHref = session?.user ? `/closet/${session.user.username}` : '/login?callbackUrl=/closet';

  return (
    <div>
      <Hero config={heroConfig} />

      <OpenClosetSection closetHref={closetHref} />

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
