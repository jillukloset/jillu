/**
 * Bulk synthetic data for Phase 8 scale audits (search/pagination correctness, query plans,
 * load testing). Not meant for demo/browsing quality — images are plain external URLs, no
 * uploads happen. Run with `npm run db:seed:stress`; wipe with `db:seed:stress:clear` before
 * a production launch (this data must never ship).
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/password';

const db = new PrismaClient();

const LISTING_COUNT = Number(process.env.STRESS_LISTINGS ?? 5000);
const BUYER_COUNT = Number(process.env.STRESS_USERS ?? 300);
const CONVERSATION_COUNT = Number(process.env.STRESS_CONVERSATIONS ?? 800);
const STRESS_TAG = 'stress-phase8';

const CONDITIONS = ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'VISIBLE_WEAR'];
const GENDERS = ['WOMEN', 'MEN', 'UNISEX'];
const LOCATIONS = ['Bengaluru, IN', 'Mumbai, IN', 'Delhi, IN', 'Pune, IN', 'Hyderabad, IN', 'Chennai, IN', 'Kolkata, IN'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '6', '7', '8', '9', '10'];
const TITLE_WORDS = [
  'Oversized', 'Vintage', 'Cropped', 'Classic', 'Distressed', 'Relaxed', 'Tailored', 'Slim',
  'Denim', 'Cotton', 'Linen', 'Wool', 'Leather', 'Corduroy', 'Satin',
  'Jacket', 'Shirt', 'Dress', 'Skirt', 'Trousers', 'Hoodie', 'Sneakers', 'Bag', 'Kurta', 'Blazer',
];
const STATUS_WEIGHTS: Array<{ status: 'ACTIVE' | 'SOLD' | 'DRAFT' | 'RESERVED' | 'ARCHIVED'; weight: number }> = [
  { status: 'ACTIVE', weight: 90 },
  { status: 'SOLD', weight: 4 },
  { status: 'DRAFT', weight: 3 },
  { status: 'RESERVED', weight: 2 },
  { status: 'ARCHIVED', weight: 1 },
];

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length]!;
}

function weightedStatus(seed: number) {
  const total = STATUS_WEIGHTS.reduce((sum, s) => sum + s.weight, 0);
  let n = seed % total;
  for (const entry of STATUS_WEIGHTS) {
    if (n < entry.weight) return entry.status;
    n -= entry.weight;
  }
  return 'ACTIVE' as const;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const rand = mulberry32(42);

  const categories = await db.category.findMany({ select: { id: true } });
  const brands = await db.brand.findMany({ select: { id: true } });
  const vibes = await db.vibe.findMany({ select: { id: true } });
  if (categories.length === 0 || brands.length === 0 || vibes.length === 0) {
    throw new Error('Run `npm run db:seed` first — stress seed reuses existing taxonomy.');
  }

  console.log(`Seeding ${BUYER_COUNT} synthetic users...`);
  const passwordHash = await hashPassword('DemoPassword123');
  const userIds: string[] = [];
  for (let batchStart = 0; batchStart < BUYER_COUNT; batchStart += 100) {
    const batch = Array.from({ length: Math.min(100, BUYER_COUNT - batchStart) }, (_, j) => {
      const i = batchStart + j;
      const id = `${STRESS_TAG}-user-${i}`;
      userIds.push(id);
      return {
        id,
        email: `${STRESS_TAG}-user-${i}@example.invalid`,
        passwordHash,
        emailVerified: new Date(),
      };
    });
    await db.user.createMany({ data: batch, skipDuplicates: true });
    await db.profile.createMany({
      data: batch.map((u, j) => ({
        userId: u.id,
        username: `${STRESS_TAG}-user-${batchStart + j}`,
        displayName: `Stress User ${batchStart + j}`,
        location: pick(LOCATIONS, batchStart + j),
      })),
      skipDuplicates: true,
    });
  }

  console.log(`Seeding ${LISTING_COUNT} synthetic listings...`);
  const listingIds: string[] = [];
  const BATCH = 500;
  for (let batchStart = 0; batchStart < LISTING_COUNT; batchStart += BATCH) {
    const count = Math.min(BATCH, LISTING_COUNT - batchStart);
    const listingsBatch = Array.from({ length: count }, (_, j) => {
      const i = batchStart + j;
      const id = `${STRESS_TAG}-listing-${i}`;
      listingIds.push(id);
      const seed = Math.floor(rand() * 1_000_000);
      const daysAgo = seed % 180;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const title = `${pick(TITLE_WORDS, seed)} ${pick(TITLE_WORDS, seed + 7)} #${i}`;
      return {
        id,
        sellerId: pick(userIds, seed),
        title,
        description: `Synthetic stress-test listing #${i} for search/pagination/load audits.`,
        price: 200 + (seed % 4800),
        categoryId: pick(categories, seed).id,
        brandId: seed % 3 === 0 ? pick(brands, seed).id : null,
        size: pick(SIZES, seed),
        condition: pick(CONDITIONS, seed) as never,
        gender: pick(GENDERS, seed) as never,
        location: pick(LOCATIONS, seed),
        status: weightedStatus(seed) as never,
        publishedAt: createdAt,
        createdAt,
        viewCount: seed % 500,
      };
    });
    await db.listing.createMany({ data: listingsBatch, skipDuplicates: true });

    await db.listingImage.createMany({
      data: listingsBatch.map((l, j) => ({
        listingId: l.id,
        objectKey: `stress/${l.id}/0.jpg`,
        url: `https://picsum.photos/seed/${STRESS_TAG}-${batchStart + j}/800/1000`,
        order: 0,
        isPrimary: true,
      })),
      skipDuplicates: true,
    });

    await db.listingVibe.createMany({
      data: listingsBatch.map((l, j) => ({ listingId: l.id, vibeId: pick(vibes, batchStart + j).id })),
      skipDuplicates: true,
    });

    console.log(`  ...${batchStart + count}/${LISTING_COUNT}`);
  }

  console.log(`Seeding ${CONVERSATION_COUNT} conversations with messages...`);
  for (let batchStart = 0; batchStart < CONVERSATION_COUNT; batchStart += 200) {
    const count = Math.min(200, CONVERSATION_COUNT - batchStart);
    const convBatch = Array.from({ length: count }, (_, j) => {
      const i = batchStart + j;
      const seed = Math.floor(rand() * 1_000_000);
      const buyer = pick(userIds, seed);
      let seller = pick(userIds, seed + 1);
      if (seller === buyer) seller = pick(userIds, seed + 2);
      const listingId = pick(listingIds, seed);
      return { id: `${STRESS_TAG}-conv-${i}`, buyerId: buyer, sellerId: seller, listingId };
    });
    await db.conversation.createMany({ data: convBatch, skipDuplicates: true });

    // skipDuplicates may have silently dropped rows that collided on the
    // (listingId, buyerId, sellerId) unique constraint — only attach messages to rows
    // that actually exist, or the message insert violates its conversationId FK.
    const insertedIds = new Set(
      (await db.conversation.findMany({ where: { id: { in: convBatch.map((c) => c.id) } }, select: { id: true } })).map(
        (c) => c.id,
      ),
    );
    const messages = convBatch.filter((c) => insertedIds.has(c.id)).flatMap((c, j) => {
      const n = 1 + ((batchStart + j) % 6);
      return Array.from({ length: n }, (_, k) => ({
        id: `${c.id}-msg-${k}`,
        conversationId: c.id,
        senderId: k % 2 === 0 ? c.buyerId : c.sellerId,
        body: `Stress message ${k} in conversation ${c.id}`,
        readAt: k < n - 1 ? new Date() : null,
        createdAt: new Date(Date.now() - (n - k) * 60_000),
      }));
    });
    await db.message.createMany({ data: messages, skipDuplicates: true });
  }

  const REPORT_COUNT = Number(process.env.STRESS_REPORTS ?? 3000);
  const AUDIT_COUNT = Number(process.env.STRESS_AUDIT_LOGS ?? 5000);
  const REASONS = ['SPAM', 'COUNTERFEIT', 'PROHIBITED_ITEM', 'MISLEADING', 'SCAM', 'INAPPROPRIATE_CONTENT', 'OTHER'];
  const REPORT_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'];

  console.log(`Seeding ${REPORT_COUNT} synthetic reports...`);
  for (let batchStart = 0; batchStart < REPORT_COUNT; batchStart += 1000) {
    const count = Math.min(1000, REPORT_COUNT - batchStart);
    const batch = Array.from({ length: count }, (_, j) => {
      const i = batchStart + j;
      const seed = Math.floor(rand() * 1_000_000);
      const daysAgo = seed % 180;
      return {
        id: `${STRESS_TAG}-report-${i}`,
        reporterId: pick(userIds, seed),
        targetType: 'LISTING' as const,
        listingId: pick(listingIds, seed),
        reason: pick(REASONS, seed) as never,
        status: pick(REPORT_STATUSES, seed) as never,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      };
    });
    await db.report.createMany({ data: batch, skipDuplicates: true });
  }

  console.log(`Seeding ${AUDIT_COUNT} synthetic audit log entries...`);
  for (let batchStart = 0; batchStart < AUDIT_COUNT; batchStart += 1000) {
    const count = Math.min(1000, AUDIT_COUNT - batchStart);
    const batch = Array.from({ length: count }, (_, j) => {
      const i = batchStart + j;
      const seed = Math.floor(rand() * 1_000_000);
      const daysAgo = seed % 180;
      return {
        id: `${STRESS_TAG}-audit-${i}`,
        actorId: pick(userIds, seed),
        action: 'STRESS_ACTION',
        targetType: 'Listing',
        targetId: pick(listingIds, seed),
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      };
    });
    await db.auditLog.createMany({ data: batch, skipDuplicates: true });
  }

  console.log('Stress seed complete.');
  console.log(`  users:+${userIds.length} listings:+${listingIds.length} conversations:+${CONVERSATION_COUNT}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
