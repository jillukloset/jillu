function objectStorageOrigin() {
  try {
    return new URL(process.env.S3_PUBLIC_URL ?? process.env.S3_ENDPOINT ?? 'http://localhost:9000').origin;
  } catch {
    return 'http://localhost:9000';
  }
}

function buildCsp() {
  const storageOrigin = objectStorageOrigin();

  // Notes on intentional exceptions:
  // - script-src/style-src need 'unsafe-inline': Next.js's App Router injects inline <script>
  //   tags for RSC/hydration bootstrapping, and next/image + our own inline `style` usage rely
  //   on inline styles. Locking these down would require nonce-based CSP wiring through
  //   middleware, which is a larger change than this hardening pass warrants for a V1 whose
  //   pages are all server-rendered from our own trusted code (no third-party script injection
  //   surface, no user-supplied HTML is ever rendered — see the XSS section of the audit).
  // - connect-src/img-src include the object storage origin because the browser uploads
  //   directly to it via presigned URLs, and every listing/avatar image is served from it.
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${storageOrigin} https://picsum.photos https://*.r2.dev`,
    `font-src 'self' data:`,
    `connect-src 'self' ${storageOrigin}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
  ];

  return directives.join('; ');
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Content-Security-Policy', value: buildCsp() },
  // Harmless (ignored) over plain HTTP in local dev; takes effect once served over HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/jillu-media/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
