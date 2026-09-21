import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listSavedListings } from '@/modules/social/save-repository';
import { toListingCard } from '@/modules/listings/mappers';
import { SavedGrid } from '@/components/saved/saved-grid';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Saved — Jillu Kloset' };

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/saved');

  const rows = await listSavedListings(session.user.id);
  const listings = rows.map((row) => toListingCard(row.listing));

  return (
    <div className="mx-auto max-w-6xl px-gutter py-10">
      <h1 className="mb-6 font-display text-3xl">Saved</h1>

      {listings.length === 0 ? (
        <EmptyState
          title="No saved pieces yet"
          description="Your next favorite might be waiting out there."
          actionLabel="Explore"
          actionHref="/explore"
        />
      ) : (
        <SavedGrid listings={listings} />
      )}
    </div>
  );
}
