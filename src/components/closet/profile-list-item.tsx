import Image from 'next/image';
import Link from 'next/link';

export function ProfileListItem({
  profile,
}: {
  profile: { username: string; displayName: string; avatarUrl: string | null };
}) {
  return (
    <Link
      href={`/closet/${profile.username}`}
      className="flex items-center gap-3 border-b border-border py-3 last:border-0"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-plum">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt={profile.displayName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-paper">
            {profile.displayName[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{profile.displayName}</p>
        <p className="text-xs text-muted">@{profile.username}</p>
      </div>
    </Link>
  );
}
