import { describe, it, expect, vi } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

import { auth } from '@/auth';
import { requireSession } from './current-user';

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

describe('requireSession', () => {
  it('throws an UNAUTHORIZED AppError when there is no session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireSession()).rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 });
  });

  it('returns the session when logged in', async () => {
    const fakeSession = { user: { id: 'abc', role: 'USER', status: 'ACTIVE', username: 'abc' } };
    mockAuth.mockResolvedValueOnce(fakeSession);
    const session = await requireSession();
    expect(session.user.id).toBe('abc');
  });
});
