import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/require-role';
import { getHeroConfig } from '@/modules/admin/hero-service';
import { HeroManager, type HeroConfigState } from '@/components/admin/hero-manager';

export const metadata: Metadata = { title: 'Admin · Homepage Hero' };

const DEFAULTS: HeroConfigState = {
  isActive: true,
  eyebrow: 'A closet for every story',
  title: 'PRE-LOVED.\nRE-LOVED.',
  subtitle: 'Discover pieces with another story.',
  backgroundUrl: null,
  backgroundObjectKey: null,
  backgroundColor: '#3B2230',
  overlayOpacity: 35,
  textAlign: 'left',
  primaryCtaLabel: 'EXPLORE',
  primaryCtaHref: '/explore',
  secondaryCtaLabel: 'SELL SOMETHING',
  secondaryCtaHref: '/sell',
};

export default async function AdminHeroPage() {
  await requireAdminPage('/admin/hero');
  const config = await getHeroConfig();

  const initial: HeroConfigState = config
    ? {
        isActive: config.isActive,
        eyebrow: config.eyebrow,
        title: config.title,
        subtitle: config.subtitle,
        backgroundUrl: config.backgroundUrl,
        backgroundObjectKey: config.backgroundObjectKey,
        backgroundColor: config.backgroundColor,
        overlayOpacity: config.overlayOpacity,
        textAlign: config.textAlign === 'center' ? 'center' : 'left',
        primaryCtaLabel: config.primaryCtaLabel,
        primaryCtaHref: config.primaryCtaHref,
        secondaryCtaLabel: config.secondaryCtaLabel,
        secondaryCtaHref: config.secondaryCtaHref,
      }
    : DEFAULTS;

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Homepage hero</h1>
      <p className="mb-6 text-sm text-slate-500">
        Customize the big banner at the top of the storefront: background image, copy, buttons, and styling.
      </p>
      <HeroManager initial={initial} />
    </div>
  );
}
