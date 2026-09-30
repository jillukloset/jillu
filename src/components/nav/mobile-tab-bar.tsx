'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { Session } from 'next-auth';
import { GridIcon, HomeIcon, MessageIcon, PlusCircleIcon, SavedBagIcon } from '@/components/icons';
import { NavBadge } from '@/components/ui/nav-badge';

export function MobileTabBar({ session }: { session: Session | null }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const tabs = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/explore', label: 'Shop', icon: GridIcon },
  ] as const;

  const trailingTabs = [
    {
      href: '/messages',
      label: 'Messages',
      icon: MessageIcon,
      badge: session ? <NavBadge queryKey="unread-message-count" apiUrl="/api/messages/unread-count" /> : null,
    },
    {
      href: '/saved',
      label: 'Saved',
      icon: SavedBagIcon,
      badge: session ? <NavBadge queryKey="saved-count" apiUrl="/api/saved/count" /> : null,
    },
  ] as const;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-surface px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((tab) => (
        <TabLink key={tab.href} {...tab} active={isActive(tab.href)} />
      ))}

      <Link
        href="/sell"
        aria-label="Sell something"
        className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-raised transition-transform active:scale-95"
      >
        <PlusCircleIcon width={26} height={26} strokeWidth={1.8} fill="none" />
      </Link>

      {trailingTabs.map((tab) => (
        <TabLink key={tab.href} {...tab} active={isActive(tab.href)} />
      ))}
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  active: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
        active ? 'text-accent-text' : 'text-muted',
      )}
    >
      <span className="relative">
        <Icon width={22} height={22} strokeWidth={active ? 2 : 1.6} />
        {badge}
      </span>
      {label}
    </Link>
  );
}
