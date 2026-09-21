import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import clsx from 'clsx';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { listSellerListings } from '@/modules/listings/repository';
import { toSellerRow } from '@/modules/listings/mappers';
import { ListingRow } from '@/components/seller/listing-row';
import { EmptyState } from '@/components/ui/empty-state';
import { buttonClassName } from '@/components/ui/button';

export const metadata: Metadata = { title: 'My closet — Jillu Kloset' };

const TABS = [
  { key: 'active', label: 'Active', statuses: ['ACTIVE', 'RESERVED'] },
  { key: 'drafts', label: 'Drafts', statuses: ['DRAFT'] },
  { key: 'sold', label: 'Sold', statuses: ['SOLD'] },
  { key: 'archived', label: 'Archived', statuses: ['ARCHIVED'] },
] as const;

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/seller');

  const { tab: tabParam } = await searchParams;
  const activeTab = TABS.find((t) => t.key === tabParam) ?? TABS[0];

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });

  const rows = (
    await Promise.all(activeTab.statuses.map((status) => listSellerListings(session.user.id, status)))
  )
    .flat()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(toSellerRow);

  return (
    <div className="mx-auto max-w-3xl px-gutter py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">My closet</h1>
          {profile ? <p className="text-sm text-muted">@{profile.username}</p> : null}
        </div>
        <Link href="/sell" className={buttonClassName('primary', 'sm')}>
          + Sell something
        </Link>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/seller?tab=${tab.key}`}
            className={clsx(
              'border-b-2 px-3 py-2 text-sm font-semibold',
              tab.key === activeTab.key ? 'border-ink text-ink' : 'border-transparent text-muted',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.label.toLowerCase()} listings`}
          description="Got something someone else should love?"
          actionLabel="Sell something"
          actionHref="/sell"
        />
      ) : (
        <div>
          {rows.map((row) => (
            <ListingRow key={row.id} listing={row} />
          ))}
        </div>
      )}
    </div>
  );
}
