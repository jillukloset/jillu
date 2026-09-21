import { AppError } from '@/lib/api-result';

/**
 * In-memory fixed-window rate limiter. Deliberately not Redis-backed — this app runs as a
 * single Node process, so a Map is sufficient for V1 and avoids an unnecessary dependency.
 * The interface (a single `hit` function keyed by an arbitrary string) is the only thing
 * call sites depend on, so swapping this module's internals for a distributed limiter
 * (Redis, Upstash, etc.) later requires no changes anywhere else.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodic cleanup so the map doesn't grow unbounded with long-tail keys (e.g. per-IP).
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupIfDue(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function hitRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanupIfDue(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: existing.resetAt - now };
}

/** Throws a 429 AppError if the key has exceeded `limit` hits within `windowMs`. */
export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const result = hitRateLimit(key, limit, windowMs);
  if (!result.allowed) {
    const seconds = Math.ceil(result.retryAfterMs / 1000);
    throw new AppError('RATE_LIMITED', `Too many attempts. Try again in ${seconds}s.`, 429);
  }
}

export function requestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** Common windows, named for readability at call sites. */
export const RATE_LIMITS = {
  signup: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min per IP
  login: { limit: 8, windowMs: 15 * 60 * 1000 }, // 8 per 15 min per email
  passwordReset: { limit: 5, windowMs: 15 * 60 * 1000 }, // per email
  messaging: { limit: 30, windowMs: 60 * 1000 }, // 30 messages/min per user
  reports: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 reports/hour per user
  socialAction: { limit: 60, windowMs: 60 * 1000 }, // like/save/follow: 60/min per user
  adminMutation: { limit: 60, windowMs: 60 * 1000 }, // 60/min per admin
} as const;
