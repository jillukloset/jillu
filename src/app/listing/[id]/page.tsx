import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { findListingById, incrementViewCount } from '@/modules/listings/repository';
import { getClosetStats, isFollowing } from '@/modules/profile/repository';
import { findLike, countLikes } from '@/modules/social/like-repository';
import { findSave } from '@/modules/social/save-repository';
import { ImageGallery } from '@/components/listing/image-gallery';
import { SellerPreview } from '@/components/listing/seller-preview';
import { LikeButton } from '@/components/listing/like-button';
import { SaveButton } from '@/components/listing/save-button';
import { ShareButton } from '@/components/listing/share-button';
import { MessageSellerButton } from '@/components/listing/message-seller-button';
import { ReportDialog } from '@/components/reports/report-dialog';
import { ConditionBadge } from '@/components/condition-badge';
import { VibeTag } from '@/components/vibe-tag';
import { Price } from '@/components/ui/price';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await findListingById(id);
  return { title: listing ? `${listing.title} — Jillu Kloset` : 'Listing — Jillu Kloset' };
}

const STATUS_LABEL: Record<string, string> = {
  RESERVED: 'Reserved',
  SOLD: 'Sold',
};

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, listing] = await Promise.all([auth(), findListingById(id)]);

  if (!listing) notFound();

  const isOwner = session?.user?.id === listing.sellerId;
  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  const isPublic = ['ACTIVE', 'RESERVED', 'SOLD'].includes(listing.status);
  if (!isPublic && !isOwner && !isStaff) notFound();

  if (!isOwner && listing.status === 'ACTIVE') {
    incrementViewCount(listing.id);
  }

  const [followerStats, viewerFollows, likeCount, viewerLike, viewerSave] = await Promise.all([
    getClosetStats(listing.sellerId),
    session?.user && !isOwner ? isFollowing(session.user.id, listing.sellerId) : Promise.resolve(false),
    countLikes(listing.id),
    session?.user ? findLike(session.user.id, listing.id) : Promise.resolve(null),
    session?.user ? findSave(session.user.id, listing.id) : Promise.resolve(null),
  ]);

  const listingUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/listing/${listing.id}`;

  return (
    <div className="mx-auto max-w-5xl px-gutter py-8">
      {isOwner && !isPublic ? (
        <p className="mb-4 rounded-md bg-plum px-4 py-2 text-sm text-paper">
          This listing is {listing.status.toLowerCase()} and only visible to you.
        </p>
      ) : null}
      {isOwner && isPublic && listing.status !== 'ACTIVE' ? (
        <p className="mb-4 rounded-md bg-plum px-4 py-2 text-sm text-paper">
          This listing is marked {listing.status.toLowerCase()}. Buyers can still view it.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative">
          <ImageGallery images={listing.images} title={listing.title} />
          {STATUS_LABEL[listing.status] ? (
            <span className="absolute left-3 top-3 rounded-pill bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
              {STATUS_LABEL[listing.status]}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">{listing.title}</h1>
            <Price amount={listing.price} currency={listing.currency} className="mt-1 block text-xl font-semibold" />
          </div>

          <div className="flex flex-wrap gap-2">
            <ConditionBadge condition={listing.condition} />
            <span className="inline-flex items-center rounded-pill border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
              Size {listing.size}
            </span>
            {listing.brand ? (
              <span className="inline-flex items-center rounded-pill border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                {listing.brand.name}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-pill border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
              {listing.category.name}
            </span>
          </div>

          {listing.vibes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {listing.vibes.map(({ vibe }) => (
                <VibeTag key={vibe.id} name={vibe.name} slug={vibe.slug} />
              ))}
            </div>
          ) : null}

          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{listing.description}</p>

          <p className="text-xs text-muted">{listing.location}</p>

          {!isOwner ? (
            <MessageSellerButton listingId={listing.id} isLoggedIn={Boolean(session?.user)} />
          ) : null}

          <div className="flex flex-wrap gap-2">
            <LikeButton
              listingId={listing.id}
              initialLiked={Boolean(viewerLike)}
              initialCount={likeCount}
              isLoggedIn={Boolean(session?.user)}
            />
            <SaveButton listingId={listing.id} initialSaved={Boolean(viewerSave)} isLoggedIn={Boolean(session?.user)} />
            <ShareButton title={listing.title} url={listingUrl} />
          </div>

          <SellerPreview
            seller={{
              id: listing.seller.id,
              username: listing.seller.profile!.username,
              displayName: listing.seller.profile!.displayName,
              avatarUrl: listing.seller.profile!.avatarUrl,
            }}
            followerCount={followerStats.followers}
            isFollowing={viewerFollows}
            isLoggedIn={Boolean(session?.user)}
            isOwner={isOwner}
          />

          {!isOwner ? (
            <ReportDialog
              targetType="LISTING"
              targetId={listing.id}
              triggerLabel="Report this listing"
              isLoggedIn={Boolean(session?.user)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
