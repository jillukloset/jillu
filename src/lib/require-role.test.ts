import { describe, it, expect, vi } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

import { auth } from '@/auth';
import { requireAdmin, requireModerator } from './require-role';

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

function sessionFor(role: string) {
  return { user: { id: 'u1', role, status: 'ACTIVE', username: 'u1' } };
}

describe('requireModerator', () => {
  it('rejects a plain USER', async () => {
    mockAuth.mockResolvedValueOnce(sessionFor('USER'));
    await expect(requireModerator()).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('allows a MODERATOR', async () => {
    mockAuth.mockResolvedValueOnce(sessionFor('MODERATOR'));
    const session = await requireModerator();
    expect(session.user.role).toBe('MODERATOR');
  });

  it('allows an ADMIN', async () => {
    mockAuth.mockResolvedValueOnce(sessionFor('ADMIN'));
    const session = await requireModerator();
    expect(session.user.role).toBe('ADMIN');
  });

  it('rejects when there is no session at all', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireModerator()).rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 });
  });
});

describe('requireAdmin', () => {
  it('rejects a plain USER', async () => {
    mockAuth.mockResolvedValueOnce(sessionFor('USER'));
    await expect(requireAdmin()).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('rejects a MODERATOR (admin-only actions)', async () => {
    mockAuth.mockResolvedValueOnce(sessionFor('MODERATOR'));
    await expect(requireAdmin()).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('allows an ADMIN', async () => {
    mockAuth.mockResolvedValueOnce(sessionFor('ADMIN'));
    const session = await requireAdmin();
    expect(session.user.role).toBe('ADMIN');
  });
});
