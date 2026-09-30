import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

import { auth } from '@/auth';
import { GET, POST } from './route';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { startOrGetConversation } from '@/modules/messaging/service';

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

function sessionFor(userId: string) {
  return { user: { id: userId, role: 'USER', status: 'ACTIVE', username: 'x' } };
}

function getRequest(conversationId: string, query = '') {
  const req = new NextRequest(`http://localhost/api/conversations/${conversationId}/messages${query}`);
  return { req, params: Promise.resolve({ id: conversationId }) };
}

function postRequest(conversationId: string, body: string) {
  const req = new NextRequest(`http://localhost/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  return { req, params: Promise.resolve({ id: conversationId }) };
}

describe('messages route (route-level)', () => {
  const cleanupIds: string[] = [];
  afterEach(async () => {
    const ids = cleanupIds.splice(0);
    for (const id of ids) {
      await cleanupTestUser(id);
    }
  });

  it('returns 401 for an unauthenticated request', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { req, params } = getRequest('some-id');
    const res = await GET(req, { params });
    expect(res.status).toBe(401);
  });

  it('returns 403 when a non-participant tries to read messages', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    const stranger = await createTestUser();
    cleanupIds.push(seller.id, buyer.id, stranger.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    mockAuth.mockResolvedValueOnce(sessionFor(stranger.id));
    const { req, params } = getRequest(conversation.id);
    const res = await GET(req, { params });
    expect(res.status).toBe(403);
  });

  it('does not run an incremental query when since is present but empty', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    mockAuth.mockResolvedValueOnce(sessionFor(buyer.id));
    const { req, params } = getRequest(conversation.id, '?since=');
    const res = await GET(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.items).toEqual([]);
    expect(json.data.sinceCursor).toBeTruthy();
  });

  it('rejects sending a message on a listing that is not messageable (e.g. SOLD)', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id, { status: 'SOLD' as never });

    // Bypass the service's own startOrGetConversation guard to simulate a conversation that
    // existed before the listing sold, so only the send-time guard is exercised.
    const { db } = await import('@/lib/db');
    const conversation = await db.conversation.create({
      data: { listingId: listing.id, buyerId: buyer.id, sellerId: seller.id },
    });

    mockAuth.mockResolvedValueOnce(sessionFor(buyer.id));
    const { req, params } = postRequest(conversation.id, 'is this still available?');
    const res = await POST(req, { params });

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe('LISTING_NOT_MESSAGEABLE');
  });

  it('rate-limits sending messages at 30/minute/user', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);

    for (let i = 0; i < 30; i += 1) {
      mockAuth.mockResolvedValueOnce(sessionFor(buyer.id));
      const { req, params } = postRequest(conversation.id, `message ${i}`);
      const res = await POST(req, { params });
      expect(res.status).toBe(201);
    }

    mockAuth.mockResolvedValueOnce(sessionFor(buyer.id));
    const { req, params } = postRequest(conversation.id, 'one too many');
    const res = await POST(req, { params });
    expect(res.status).toBe(429);
  });
});
