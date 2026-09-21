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

function makeRequest(kind: string, body: unknown) {
  const req = new NextRequest(`http://localhost/api/admin/taxonomy/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { req, params: Promise.resolve({ kind }) };
}

describe('POST /api/admin/taxonomy/[kind] (route-level)', () => {
  const cleanupUserIds: string[] = [];
  const cleanupVibeIds: string[] = [];

  afterAll(async () => {
    await db.vibe.deleteMany({ where: { id: { in: cleanupVibeIds } } });
    await Promise.all(cleanupUserIds.map(cleanupTestUser));
  });

  it('returns 403 for a MODERATOR — taxonomy management is admin-only', async () => {
    const moderator = await createTestUser();
    await db.user.update({ where: { id: moderator.id }, data: { role: 'MODERATOR' } });
    cleanupUserIds.push(moderator.id);

    mockAuth.mockResolvedValueOnce(sessionFor(moderator.id, 'MODERATOR'));
    const { req, params } = makeRequest('vibes', { name: `RouteTest${Date.now()}` });
    const res = await POST(req, { params });
    expect(res.status).toBe(403);
  });

  it('returns 201 and creates the entry for an ADMIN', async () => {
    const admin = await createTestUser();
    await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
    cleanupUserIds.push(admin.id);

    mockAuth.mockResolvedValueOnce(sessionFor(admin.id, 'ADMIN'));
    const name = `RouteTest${Date.now()}`;
    const { req, params } = makeRequest('vibes', { name });
    const res = await POST(req, { params });
    expect(res.status).toBe(201);

    const json = await res.json();
    cleanupVibeIds.push(json.data.id);
    expect(json.data.name).toBe(name);
  });

  it('returns 404 for an unknown taxonomy kind', async () => {
    const admin = await createTestUser();
    await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
    cleanupUserIds.push(admin.id);

    mockAuth.mockResolvedValueOnce(sessionFor(admin.id, 'ADMIN'));
    const { req, params } = makeRequest('bogus-kind', { name: 'X' });
    const res = await POST(req, { params });
    expect(res.status).toBe(404);
  });
});
