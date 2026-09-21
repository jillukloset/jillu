import { db } from '@/lib/db';
import { hashPassword } from '@/modules/auth/password';

// Vitest runs test files in separate parallel workers, each with its own module state,
// so a counter/timestamp alone can collide across files. Add randomness for cross-worker uniqueness.
function unique(prefix: string) {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}

export async function createTestUser(overrides?: { emailVerified?: boolean }) {
  const tag = unique('t');
  const passwordHash = await hashPassword('TestPassword123');
  return db.user.create({
    data: {
      email: `${tag}@test.jillukloset.com`,
      passwordHash,
      emailVerified: overrides?.emailVerified === false ? null : new Date(),
      profile: {
        create: {
          username: tag,
          displayName: `Test ${tag}`,
        },
      },
    },
    include: { profile: true },
  });
}

export async function createTestListing(sellerId: string, overrides?: Partial<{ status: string }>) {
  const category = await db.category.upsert({
    where: { name: 'TestCategory' },
    update: {},
    create: { name: 'TestCategory', slug: 'test-category' },
  });

  return db.listing.create({
    data: {
      sellerId,
      title: unique('Test listing '),
      description: 'A test listing description that is long enough.',
      price: 500,
      categoryId: category.id,
      size: 'M',
      condition: 'GOOD',
      gender: 'UNISEX',
      location: 'Test City',
      status: (overrides?.status as never) ?? 'ACTIVE',
      images: {
        create: [
          { objectKey: 'test/1', url: 'http://localhost:9000/jillu-media/test/1.jpg', order: 0, isPrimary: true },
          { objectKey: 'test/2', url: 'http://localhost:9000/jillu-media/test/2.jpg', order: 1, isPrimary: false },
          { objectKey: 'test/3', url: 'http://localhost:9000/jillu-media/test/3.jpg', order: 2, isPrimary: false },
          { objectKey: 'test/4', url: 'http://localhost:9000/jillu-media/test/4.jpg', order: 3, isPrimary: false },
        ],
      },
    },
  });
}

export async function cleanupTestUser(userId: string) {
  const ownedListings = await db.listing.findMany({ where: { sellerId: userId }, select: { id: true } });
  const listingIds = ownedListings.map((l) => l.id);

  // Conversation -> User and Conversation -> Listing have no cascading delete, so
  // conversations (and their messages, which do cascade from Conversation) must go first.
  await db.conversation.deleteMany({
    where: {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
        ...(listingIds.length ? [{ listingId: { in: listingIds } }] : []),
      ],
    },
  });

  // Report -> User (reporterId, targetUserId) and Report -> Listing also have no cascading delete.
  await db.report.deleteMany({
    where: {
      OR: [
        { reporterId: userId },
        { targetUserId: userId },
        ...(listingIds.length ? [{ listingId: { in: listingIds } }] : []),
      ],
    },
  });

  // AuditLog -> User (actorId) also has no cascading delete.
  await db.auditLog.deleteMany({ where: { actorId: userId } });

  await db.notification.deleteMany({ where: { userId } });
  await db.like.deleteMany({ where: { userId } });
  await db.save.deleteMany({ where: { userId } });
  await db.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } });
  await db.block.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } });
  await db.listing.deleteMany({ where: { sellerId: userId } });
  await db.profile.deleteMany({ where: { userId } });
  await db.user.deleteMany({ where: { id: userId } });
}
