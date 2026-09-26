import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, createTestListing, cleanupTestUser } from '@/test-utils/factories';
import { findListingById } from '@/modules/listings/repository';
import { findConversationById, listConversationsForUser } from '@/modules/messaging/repository';
import { startOrGetConversation, sendMessage } from '@/modules/messaging/service';
import { listListingsForAdmin } from '@/modules/admin/listings-repository';
import { listReportsForAdmin } from '@/modules/admin/reports-repository';
import { listUsers, findUserForAdmin } from '@/modules/admin/users-repository';
import { listAuditLogs, recordAuditLog } from '@/modules/admin/audit';
import { reportListing } from '@/modules/reports/service';

// A relation query on `User` (buyer/seller/reporter/actor/targetUser/seller) must use an
// explicit Prisma `select`, never a bare `include: true` — otherwise Prisma serializes every
// scalar column on User, including `passwordHash`, straight into the API/page response. This
// was found live during the Phase 8 audit: any anonymous visitor could pull a seller's bcrypt
// hash off the public listing API, and any conversation participant could pull the other
// party's hash. These tests assert the property directly against JSON-serialized query output,
// so a future relation added without an explicit `select` fails loudly here instead of shipping.
function assertNoPasswordHash(value: unknown) {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain('passwordHash');
}

describe('no User relation ever serializes passwordHash', () => {
  const cleanupIds: string[] = [];

  afterAll(async () => {
    for (const id of cleanupIds) {
      await cleanupTestUser(id);
    }
  });

  it('findListingById (public listing detail) does not include the seller passwordHash', async () => {
    const seller = await createTestUser();
    cleanupIds.push(seller.id);
    const listing = await createTestListing(seller.id);

    const result = await findListingById(listing.id);
    assertNoPasswordHash(result);
  });

  it('findConversationById and listConversationsForUser do not include participant passwordHash', async () => {
    const seller = await createTestUser();
    const buyer = await createTestUser();
    cleanupIds.push(seller.id, buyer.id);
    const listing = await createTestListing(seller.id);
    const conversation = await startOrGetConversation(buyer.id, listing.id);
    await sendMessage(conversation.id, buyer.id, 'hi');

    assertNoPasswordHash(await findConversationById(conversation.id));
    assertNoPasswordHash(await listConversationsForUser(seller.id));
  });

  it('admin listing/report/user/audit queries do not include any User passwordHash', async () => {
    const admin = await createTestUser();
    const seller = await createTestUser();
    const reporter = await createTestUser();
    cleanupIds.push(admin.id, seller.id, reporter.id);
    const listing = await createTestListing(seller.id);
    await reportListing(reporter.id, listing.id, { reason: 'SPAM' });
    await recordAuditLog(admin.id, 'TEST_ACTION', 'LISTING', listing.id);

    assertNoPasswordHash(await listListingsForAdmin({}));
    assertNoPasswordHash(await listReportsForAdmin({}));
    assertNoPasswordHash(await listUsers({}));
    assertNoPasswordHash(await findUserForAdmin(seller.id));
    assertNoPasswordHash(await listAuditLogs());
  });
});
