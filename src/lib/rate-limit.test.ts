import { describe, it, expect, vi, afterEach } from 'vitest';
import { enforceRateLimit, hitRateLimit, requestIp } from './rate-limit';

describe('hitRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the limit, then blocks', () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(hitRateLimit(key, 3, 60_000).allowed).toBe(true);
    }
    const fourth = hitRateLimit(key, 3, 60_000);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    vi.useFakeTimers();
    const key = `test-window-${Math.random()}`;
    expect(hitRateLimit(key, 1, 1000).allowed).toBe(true);
    expect(hitRateLimit(key, 1, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(hitRateLimit(key, 1, 1000).allowed).toBe(true);
  });

  it('tracks independent keys separately', () => {
    const a = `key-a-${Math.random()}`;
    const b = `key-b-${Math.random()}`;
    expect(hitRateLimit(a, 1, 60_000).allowed).toBe(true);
    expect(hitRateLimit(a, 1, 60_000).allowed).toBe(false);
    // A different key should not be affected by A's usage.
    expect(hitRateLimit(b, 1, 60_000).allowed).toBe(true);
  });
});

describe('enforceRateLimit', () => {
  it('throws a 429 AppError once the limit is exceeded', () => {
    const key = `enforce-${Date.now()}-${Math.random()}`;
    enforceRateLimit(key, 2, 60_000);
    enforceRateLimit(key, 2, 60_000);
    expect(() => enforceRateLimit(key, 2, 60_000)).toThrowError(
      expect.objectContaining({ code: 'RATE_LIMITED', status: 429 }),
    );
  });
});

describe('requestIp', () => {
  it('reads the first address from x-forwarded-for', () => {
    const req = new Request('http://localhost', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } });
    expect(requestIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip, then "unknown"', () => {
    const withRealIp = new Request('http://localhost', { headers: { 'x-real-ip': '9.9.9.9' } });
    expect(requestIp(withRealIp)).toBe('9.9.9.9');

    const bare = new Request('http://localhost');
    expect(requestIp(bare)).toBe('unknown');
  });
});
