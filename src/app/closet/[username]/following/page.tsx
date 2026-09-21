import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findProfileByUsername } from '@/modules/profile/repository';
import { listFollowing } from '@/modules/social/follow-repository';
import { ProfileListItem } from '@/components/closet/profile-list-item';
import { EmptyState } from '@/components/ui/empty-state';

const PAGE_SIZE = 20;

export default async function FollowingPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { username } = await params;
  const { cursor } = await searchParams;

  const profile = await findProfileByUsername(username);
  if (!profile) notFound();

  const rows = await listFollowing(profile.userId, cursor, PAGE_SIZE);
  const hasMore = rows.length > PAGE_SIZE;
  const page = rows.slice(0, PAGE_SIZE);

  return (
    <div className="mx-auto max-w-md px-gutter py-10">
      <h1 className="mb-1 font-display text-2xl">Following</h1>
      <p className="mb-6 text-sm text-muted">@{profile.username}</p>

      {page.length === 0 ? (
        <EmptyState title="Not following anyone yet" description="Closets they follow will show up here." />
      ) : (
        <div>
          {page.map((row) => (
            <ProfileListItem key={row.id} profile={row.following.profile!} />
          ))}
        </div>
      )}

      {hasMore && page.at(-1) ? (
        <Link
          href={`/closet/${username}/following?cursor=${page.at(-1)!.id}`}
          className="mt-4 block text-center text-sm font-semibold text-ink underline"
        >
          Load more
        </Link>
      ) : null}
    </div>
  );
}
