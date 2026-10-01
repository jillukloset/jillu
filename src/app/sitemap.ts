import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { getAppUrl } from '@/lib/env';

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/explore', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/partner', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/help', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/returns-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/shipping-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
];

// Capped so a fast-growing catalog can't produce an unbounded sitemap; beyond this, split into
// multiple sitemaps via generateSitemaps() when the listing count actually gets here.
const MAX_LISTINGS = 5000;
const MAX_PROFILES = 2000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl();

  const [listings, sellerIds] = await Promise.all([
    db.listing.findMany({
      where: { status: { in: ['ACTIVE', 'RESERVED', 'SOLD'] } },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: MAX_LISTINGS,
    }),
    db.listing.findMany({
      where: { status: { in: ['ACTIVE', 'RESERVED', 'SOLD'] } },
      select: { sellerId: true },
      distinct: ['sellerId'],
      take: MAX_PROFILES,
    }),
  ]);

  const profiles = await db.profile.findMany({
    where: { userId: { in: sellerIds.map((s) => s.sellerId) } },
    select: { username: true, updatedAt: true },
  });

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${appUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const listingEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${appUrl}/listing/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const profileEntries: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: `${appUrl}/closet/${profile.username}`,
    lastModified: profile.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...listingEntries, ...profileEntries];
}
