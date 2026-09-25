import { requireAdminPage } from '@/lib/require-role';

/**
 * The admin-only check must live in a layout ABOVE each page's own loading.tsx, not inside
 * the page component itself: a page wrapped in a Suspense boundary (which loading.tsx
 * creates) has already streamed a 200 shell by the time a notFound() thrown during its
 * render resolves, so the response's HTTP status code stays 200 even though the actual
 * content correctly renders the not-found UI. A parent layout renders before that boundary
 * exists, so notFound() here sets the real status code.
 */
export default async function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage('/admin');
  return children;
}
