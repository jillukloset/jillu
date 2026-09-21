/**
 * Only ever follow same-origin, relative redirect targets (e.g. from a `callbackUrl` query
 * param). Rejects absolute URLs, protocol-relative URLs (`//evil.com`), and anything with a
 * scheme, which would otherwise let an attacker craft a link like
 * `/login?callbackUrl=https://evil.com` to redirect a user off-site after a real login.
 */
export function safeRedirectPath(path: string | null | undefined, fallback = '/'): string {
  if (!path) return fallback;
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//')) return fallback;
  if (path.includes('\\')) return fallback;
  try {
    // Anything that parses as a valid absolute URL relative to a dummy base but resolves to a
    // different origin/scheme is not a same-origin relative path.
    const resolved = new URL(path, 'http://internal.invalid');
    if (resolved.origin !== 'http://internal.invalid') return fallback;
  } catch {
    return fallback;
  }
  return path;
}
