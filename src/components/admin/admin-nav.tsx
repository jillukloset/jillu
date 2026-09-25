'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type NavLink = { href: string; label: string; exact?: boolean; adminOnly?: boolean };

const LINKS: NavLink[] = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/analytics/marketplace-health', label: 'Marketplace Health', adminOnly: true },
  { href: '/admin/analytics/users', label: 'User Analytics', adminOnly: true },
  { href: '/admin/analytics/listings', label: 'Listing Analytics', adminOnly: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/listings', label: 'Listings' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/categories', label: 'Categories', adminOnly: true },
  { href: '/admin/brands', label: 'Brands', adminOnly: true },
  { href: '/admin/vibes', label: 'Vibes', adminOnly: true },
  { href: '/admin/audit', label: 'Audit log', adminOnly: true },
];

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {LINKS.filter((link) => !link.adminOnly || isAdmin).map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-ink text-paper' : 'text-ink hover:bg-slate-200',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
