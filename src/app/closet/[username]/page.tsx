import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { AppError } from '@/lib/api-result';
import { getCloset } from '@/modules/profile/service';
import { getActiveListingsForSeller } from '@/modules/profile/repository';
import { toListingCard } from '@/modules/listings/mappers';
import { ClosetHeader } from '@/components/closet/closet-header';
import { ProductGrid } from '@/components/product-grid';
import { EmptyState } from '@/components/ui/empty-state';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} — Jillu Kloset` };
}

export default async function ClosetPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();

  let closet;
  try {
    closet = await getCloset(username, session?.user?.id);
  } catch (error) {
    if (error instanceof AppError && error.code === 'CLOSET_NOT_FOUND') notFound();
    throw error;
  }

  const listings = await getActiveListingsForSeller(closet.profile.userId);

  return (
    <div className="mx-auto max-w-6xl">
      <ClosetHeader
        profile={closet.profile}
        stats={closet.stats}
        isOwner={closet.isOwner}
        isFollowing={closet.isFollowing}
        isLoggedIn={Boolean(session?.user)}
      />

      <div className="px-gutter py-10">
        <h2 className="mb-6 font-display text-xl">My pieces</h2>
        {listings.length === 0 ? (
          closet.isOwner ? (
            <EmptyState
              title="Your closet is empty"
              description="Got something someone else should love?"
              actionLabel="Sell something"
              actionHref="/sell"
            />
          ) : (
            <EmptyState
              title="Nothing here yet"
              description={`${closet.profile.displayName} hasn't listed anything yet.`}
            />
          )
        ) : (
          <ProductGrid listings={listings.map(toListingCard)} />
        )}
      </div>
    </div>
  );
}
