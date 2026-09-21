import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it('allows a normal relative path', () => {
    expect(safeRedirectPath('/messages')).toBe('/messages');
    expect(safeRedirectPath('/sell/abc123/edit')).toBe('/sell/abc123/edit');
  });

  it('allows a relative path with query string', () => {
    expect(safeRedirectPath('/explore?vibe=y2k')).toBe('/explore?vibe=y2k');
  });

  it('rejects an absolute external URL (the actual attack: /login?callbackUrl=https://evil.com)', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/');
    expect(safeRedirectPath('http://evil.com/phish')).toBe('/');
  });

  it('rejects a protocol-relative URL', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/');
  });

  it('rejects a path missing the leading slash', () => {
    expect(safeRedirectPath('evil.com')).toBe('/');
    expect(safeRedirectPath('messages')).toBe('/');
  });

  it('rejects javascript: and data: style values', () => {
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/');
    expect(safeRedirectPath('data:text/html,evil')).toBe('/');
  });

  it('falls back to the given default, or "/" when none given', () => {
    expect(safeRedirectPath(null)).toBe('/');
    expect(safeRedirectPath(undefined, '/admin')).toBe('/admin');
    expect(safeRedirectPath('https://evil.com', '/admin')).toBe('/admin');
  });

  it('rejects backslash tricks browsers sometimes treat as forward slashes', () => {
    expect(safeRedirectPath('/\\evil.com')).toBe('/');
  });
});
