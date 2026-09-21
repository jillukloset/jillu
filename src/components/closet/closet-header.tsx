import Image from 'next/image';
import Link from 'next/link';
import { FollowButton } from './follow-button';
import { buttonClassName } from '@/components/ui/button';

export function ClosetHeader({
  profile,
  stats,
  isOwner,
  isFollowing,
  isLoggedIn,
}: {
  profile: {
    userId: string;
    username: string;
    displayName: string;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
  };
  stats: { followers: number; following: number; activeListings: number; soldListings: number };
  isOwner: boolean;
  isFollowing: boolean;
  isLoggedIn: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 border-b border-border px-gutter pb-10 pt-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">My closet</p>

      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-plum sm:h-28 sm:w-28">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt={profile.displayName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-paper">
            {profile.displayName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl text-ink">{profile.displayName}</h1>
        <p className="text-sm text-muted">
          @{profile.username}
          {profile.location ? ` · ${profile.location}` : ''}
        </p>
      </div>

      {profile.bio ? <p className="max-w-md text-sm text-ink">{profile.bio}</p> : null}

      <div className="flex items-center gap-6 text-sm">
        <Stat label="listings" value={stats.activeListings} />
        <Stat label="followers" value={stats.followers} href={`/closet/${profile.username}/followers`} />
        <Stat label="following" value={stats.following} href={`/closet/${profile.username}/following`} />
      </div>

      {isOwner ? (
        <div className="flex gap-2">
          <Link href="/seller" className={buttonClassName('primary', 'sm')}>
            Manage listings
          </Link>
          <Link href="/settings/profile" className={buttonClassName('secondary', 'sm')}>
            Edit profile
          </Link>
        </div>
      ) : (
        <FollowButton targetUserId={profile.userId} initialFollowing={isFollowing} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="flex flex-col items-center">
      <span className="font-semibold text-ink">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
  return href ? (
    <Link href={href} className="transition-opacity hover:opacity-70">
      {content}
    </Link>
  ) : (
    content
  );
}
