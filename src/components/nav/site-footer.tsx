import Link from 'next/link';

const FOOTER_COLUMNS = [
  {
    heading: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How Jillu Kloset Works?', href: '/how-it-works' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Partner Up', href: '/partner' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Returns Policy', href: '/returns-policy' },
      { label: 'Shipping Policy', href: '/shipping-policy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 bg-plum px-gutter py-14 text-paper">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-paper/20 to-transparent" />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:flex-wrap sm:justify-between">
        <div className="max-w-xs">
          <span className="font-display text-2xl tracking-tight">JILLU</span>
          <p className="mt-2 text-sm text-paper/60">Pre-loved. Re-loved. A closet for every story.</p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">{column.heading}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/80 underline decoration-paper/0 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper/60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-paper/10 pt-6">
        <p className="text-xs text-paper/40">© {new Date().getFullYear()} Jillu Kloset. All rights reserved.</p>
      </div>
    </footer>
  );
}
