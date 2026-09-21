import Link from 'next/link';
import type { Session } from 'next-auth';
import { SearchIcon } from '@/components/icons';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function MobileTopBar({ session }: { session: Session | null }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-paper/95 px-gutter py-3 backdrop-blur md:hidden">
      <Link href="/" className="font-display text-xl tracking-tight text-ink">
        JILLU
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/search" aria-label="Search" className="-m-3 p-3 text-ink">
          <SearchIcon />
        </Link>
        {session ? <NotificationBell className="-m-3 p-3" /> : null}
        {session ? (
          <Link href={`/closet/${session.user.username}`} aria-label="My closet" className="-m-3 flex p-3">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-semibold text-paper">
              {session.user.name?.[0]?.toUpperCase() ?? 'J'}
            </span>
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-ink">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
