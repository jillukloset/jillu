import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/settings', '/messages', '/notifications'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
