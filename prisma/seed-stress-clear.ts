/** Removes all synthetic data created by seed-stress.ts, identified by the "stress-phase8-" id prefix. */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const STRESS_TAG = 'stress-phase8';

async function main() {
  console.log('Removing stress-test data...');
  await db.auditLog.deleteMany({ where: { id: { startsWith: `${STRESS_TAG}-` } } });
  await db.report.deleteMany({ where: { id: { startsWith: `${STRESS_TAG}-` } } });
  await db.message.deleteMany({ where: { id: { startsWith: `${STRESS_TAG}-` } } });
  await db.conversation.deleteMany({ where: { id: { startsWith: `${STRESS_TAG}-` } } });
  await db.listingImage.deleteMany({ where: { listingId: { startsWith: `${STRESS_TAG}-` } } });
  await db.listingVibe.deleteMany({ where: { listingId: { startsWith: `${STRESS_TAG}-` } } });
  await db.listing.deleteMany({ where: { id: { startsWith: `${STRESS_TAG}-` } } });
  await db.profile.deleteMany({ where: { userId: { startsWith: `${STRESS_TAG}-` } } });
  await db.user.deleteMany({ where: { id: { startsWith: `${STRESS_TAG}-` } } });
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
