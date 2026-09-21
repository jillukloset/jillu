import { describe, it, expect, vi, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

import { auth } from '@/auth';
import { POST } from './route';
import { createTestUser, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

function sessionFor(userId: string, role: string) {
  return { user: { id: userId, role, status: 'ACTIVE', username: 'x' } };
}

function makeRequest(id: string) {
  const req = new NextRequest(`http://localhost/api/admin/users/${id}/suspend`, { method: 'POST' });
  return { req, params: Promise.resolve({ id }) };
}

describe('POST /api/admin/users/[id]/suspend (route-level)', () => {
  const cleanupIds: string[] = [];
  afterAll(async () => {
    await Promise.all(cleanupIds.map(cleanupTestUser));
  });

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { req, params } = makeRequest('some-id');
    const res = await POST(req, { params });
    expect(res.status).toBe(401);
  });

  it('returns 403 when the caller is a plain USER — cannot call admin API directly', async () => {
    const target = await createTestUser();
    cleanupIds.push(target.id);
    mockAuth.mockResolvedValueOnce(sessionFor('some-user-id', 'USER'));

    const { req, params } = makeRequest(target.id);
    const res = await POST(req, { params });
    expect(res.status).toBe(403);

    const untouched = await db.user.findUnique({ where: { id: target.id } });
    expect(untouched?.status).toBe('ACTIVE');
  });

  it('returns 200 and actually suspends when the caller is a MODERATOR', async () => {
    const moderator = await createTestUser();
    await db.user.update({ where: { id: moderator.id }, data: { role: 'MODERATOR' } });
    const target = await createTestUser();
    cleanupIds.push(moderator.id, target.id);

    mockAuth.mockResolvedValueOnce(sessionFor(moderator.id, 'MODERATOR'));
    const { req, params } = makeRequest(target.id);
    const res = await POST(req, { params });
    expect(res.status).toBe(200);

    const updated = await db.user.findUnique({ where: { id: target.id } });
    expect(updated?.status).toBe('SUSPENDED');
  });
});
