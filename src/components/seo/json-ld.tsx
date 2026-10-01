import { getAppUrl } from '@/lib/env';

/**
 * Organization + WebSite structured data, read by Google to power brand search features
 * (knowledge panel, logo in results) and the sitelinks search box. Sitelinks themselves are
 * algorithmic and can't be requested directly — this, a clean sitemap, and consistent internal
 * linking are what make a site eligible for them.
 */
export function JsonLd() {
  const appUrl = getAppUrl();

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${appUrl}/#organization`,
        name: 'Jillu Kloset',
        url: appUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${appUrl}/icon-512.png`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${appUrl}/#website`,
        url: appUrl,
        name: 'Jillu Kloset',
        description: 'A fashion-focused social resale marketplace. Pre-loved. Re-loved.',
        publisher: { '@id': `${appUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${appUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
