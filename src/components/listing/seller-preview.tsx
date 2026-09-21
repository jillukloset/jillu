import Image from 'next/image';
import Link from 'next/link';
import { FollowButton } from '@/components/closet/follow-button';
import { buttonClassName } from '@/components/ui/button';

export function SellerPreview({
  seller,
  followerCount,
  isFollowing,
  isLoggedIn,
  isOwner,
}: {
  seller: { id: string; username: string; displayName: string; avatarUrl: string | null };
  followerCount: number;
  isFollowing: boolean;
  isLoggedIn: boolean;
  isOwner: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Sold by</p>
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-plum">
          {seller.avatarUrl ? (
            <Image src={seller.avatarUrl} alt={seller.displayName} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-paper">
              {seller.displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{seller.displayName}</p>
          <p className="text-xs text-muted">
            @{seller.username} · {followerCount} followers
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href={`/closet/${seller.username}`} className={buttonClassName('secondary', 'sm', 'flex-1')}>
          View closet
        </Link>
        {!isOwner ? (
          <FollowButton targetUserId={seller.id} initialFollowing={isFollowing} isLoggedIn={isLoggedIn} />
        ) : null}
      </div>
    </div>
  );
}
