import Link from 'next/link';
import type { Session } from 'next-auth';
import { SearchBar } from './search-bar';
import { HeartIcon, MessageIcon, PlusCircleIcon } from '@/components/icons';
import { logoutAction } from '@/modules/auth/actions';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function DesktopNav({ session }: { session: Session | null }) {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-paper/95 backdrop-blur md:block">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-8 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          JILLU
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold tracking-wide">
          <Link href="/explore" className="transition-colors hover:text-accent-text">
            SHOP
          </Link>
          <Link href="/sell" className="transition-colors hover:text-accent-text">
            SELL
          </Link>
        </nav>

        <SearchBar className="ml-4 flex-1 max-w-md" />

        <div className="flex items-center gap-5">
          <Link
            href="/saved"
            aria-label="Saved pieces"
            className="-m-3 p-3 text-ink transition-colors hover:text-accent-text"
          >
            <HeartIcon />
          </Link>
          <Link
            href="/messages"
            aria-label="Messages"
            className="-m-3 p-3 text-ink transition-colors hover:text-accent-text"
          >
            <MessageIcon />
          </Link>
          {session ? <NotificationBell className="-m-3 p-3 hover:text-accent-text" /> : null}

          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href={`/closet/${session.user.username}`}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-semibold text-paper">
                  {session.user.name?.[0]?.toUpperCase() ?? 'J'}
                </span>
                {session.user.username}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold hover:text-accent-text">
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-paper transition-transform hover:scale-[1.03]"
              >
                <PlusCircleIcon width={16} height={16} />
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
