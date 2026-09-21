import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { hashPassword } from '../src/modules/auth/password';

const db = new PrismaClient();

const s3 = new S3Client({
  region: process.env.S3_REGION ?? 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
});
const S3_BUCKET = process.env.S3_BUCKET ?? 'jillu-media';
const S3_PUBLIC_URL = (process.env.S3_PUBLIC_URL ?? '').replace(/\/$/, '');

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Bags', 'Accessories', 'Ethnic Wear'];

const BRANDS = [
  'Zara',
  'H&M',
  'Nike',
  'Adidas',
  "Levi's",
  'Urban Outfitters',
  'Forever 21',
  'Uniqlo',
  'Fabindia',
  'Unbranded',
];

const VIBES = ['Y2K', 'Streetwear', 'Vintage', 'Grunge', 'Minimal', 'Coquette', 'Old Money', 'Desi Fusion', 'Unisex'];

const CONDITIONS = ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'VISIBLE_WEAR'];
const GENDERS = ['WOMEN', 'MEN', 'UNISEX'];
const LOCATIONS = ['Bengaluru, IN', 'Mumbai, IN', 'Delhi, IN', 'Pune, IN', 'Hyderabad, IN', 'Chennai, IN', 'Kolkata, IN'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '6', '7', '8', '9', '10'];

const SELLERS = [
  { username: 'meera.kapoor', name: 'Meera Kapoor', bio: 'Curating vintage denim and Y2K finds. Slow fashion, fast shipping.', location: 'Bengaluru, IN' },
  { username: 'arjun.thrifts', name: 'Arjun Rao', bio: 'Streetwear and sneaker rotation. DM for sizing.', location: 'Mumbai, IN' },
  { username: 'kiara.closet', name: 'Kiara Menon', bio: 'Coquette and old money pieces from my own closet.', location: 'Delhi, IN' },
  { username: 'devs.drops', name: 'Dev Sharma', bio: 'Grunge and vintage band tees. Real vintage only.', location: 'Pune, IN' },
  { username: 'ananya.reworks', name: 'Ananya Iyer', bio: 'Desi fusion and reworked ethnic wear.', location: 'Hyderabad, IN' },
  { username: 'rohan.staples', name: 'Rohan Verma', bio: 'Minimal, unisex basics in great condition.', location: 'Chennai, IN' },
];

const PRODUCTS: Array<{
  title: string;
  description: string;
  category: string;
  brand?: string;
  vibes: string[];
  gender: (typeof GENDERS)[number];
  priceRange: [number, number];
}> = [
  { title: 'Oversized Butterfly Print Top', description: 'Barely worn Y2K butterfly print top. Perfect for festival season.', category: 'Tops', vibes: ['Y2K', 'Coquette'], gender: 'WOMEN', priceRange: [500, 1200] },
  { title: 'Vintage Levi\'s Denim Jacket', description: 'Classic vintage trucker jacket with natural fading and character.', category: 'Outerwear', brand: "Levi's", vibes: ['Vintage', 'Streetwear'], gender: 'UNISEX', priceRange: [1500, 2500] },
  { title: 'Nike Air Max Sneakers', description: 'Lightly used Nike Air Max, great cushioning still intact.', category: 'Footwear', brand: 'Nike', vibes: ['Streetwear'], gender: 'UNISEX', priceRange: [2500, 4500] },
  { title: 'Grunge Flannel Shirt', description: '90s-inspired oversized flannel, soft worn-in cotton.', category: 'Tops', vibes: ['Grunge', 'Vintage'], gender: 'UNISEX', priceRange: [600, 1100] },
  { title: 'Old Money Wool Blazer', description: 'Tailored wool-blend blazer, timeless silhouette.', category: 'Outerwear', brand: 'Zara', vibes: ['Old Money', 'Minimal'], gender: 'WOMEN', priceRange: [1800, 3200] },
  { title: 'Desi Fusion Embroidered Kurta', description: 'Hand embroidered kurta, reworked with a modern cut.', category: 'Ethnic Wear', brand: 'Fabindia', vibes: ['Desi Fusion'], gender: 'WOMEN', priceRange: [900, 1800] },
  { title: 'Adidas Track Pants', description: 'Classic three-stripe track pants, tapered fit.', category: 'Bottoms', brand: 'Adidas', vibes: ['Streetwear', 'Unisex'], gender: 'UNISEX', priceRange: [700, 1400] },
  { title: 'Coquette Lace Slip Dress', description: 'Delicate lace-trim slip dress, worn once for a shoot.', category: 'Dresses', vibes: ['Coquette', 'Vintage'], gender: 'WOMEN', priceRange: [1100, 2000] },
  { title: 'Minimal Cotton Shirt', description: 'Clean-lined cotton shirt in an off-white tone.', category: 'Tops', brand: 'Uniqlo', vibes: ['Minimal', 'Old Money'], gender: 'MEN', priceRange: [500, 900] },
  { title: 'Y2K Low-Rise Cargo Pants', description: 'Low-rise cargo pants with side pockets, true Y2K era.', category: 'Bottoms', vibes: ['Y2K', 'Streetwear'], gender: 'WOMEN', priceRange: [900, 1600] },
  { title: 'Vintage Band Tee', description: 'Faded vintage graphic tee, single stitch collar.', category: 'Tops', vibes: ['Vintage', 'Grunge'], gender: 'UNISEX', priceRange: [700, 1500] },
  { title: 'Forever 21 Mini Skirt', description: 'Pleated mini skirt, great for layering.', category: 'Bottoms', brand: 'Forever 21', vibes: ['Coquette', 'Y2K'], gender: 'WOMEN', priceRange: [400, 900] },
  { title: 'Leather Crossbody Bag', description: 'Genuine leather crossbody, minor wear on the strap.', category: 'Bags', vibes: ['Old Money', 'Minimal'], gender: 'UNISEX', priceRange: [1200, 2800] },
  { title: 'Urban Outfitters Cardigan', description: 'Chunky knit cardigan, oversized fit.', category: 'Tops', brand: 'Urban Outfitters', vibes: ['Minimal', 'Coquette'], gender: 'WOMEN', priceRange: [800, 1600] },
  { title: 'Reworked Denim Shorts', description: 'Hand-distressed denim shorts, upcycled from vintage jeans.', category: 'Bottoms', vibes: ['Grunge', 'Y2K'], gender: 'UNISEX', priceRange: [500, 1000] },
  { title: 'Chunky Platform Boots', description: 'Statement platform boots, worn a handful of times.', category: 'Footwear', vibes: ['Grunge', 'Streetwear'], gender: 'UNISEX', priceRange: [1600, 3000] },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length]!;
}

function randomInRange([min, max]: [number, number], seed: number) {
  const span = max - min;
  return min + (seed * 37) % span;
}

async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function seedImage(slug: string, order: number): Promise<{ objectKey: string; url: string }> {
  const objectKey = `seed/${slug}/${order}.jpg`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetchWithTimeout(`https://picsum.photos/seed/jillu-${slug}-${order}/800/1000`, 15000);
      if (!res.ok) throw new Error(`picsum returned ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());

      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: objectKey,
          Body: buffer,
          ContentType: 'image/jpeg',
        }),
      );

      return { objectKey, url: `${S3_PUBLIC_URL}/${objectKey}` };
    } catch (error) {
      if (attempt === 3) {
        console.warn(`  ! Failed to seed image ${objectKey} after 3 attempts:`, (error as Error).message);
        return { objectKey, url: `${S3_PUBLIC_URL}/${objectKey}` };
      }
    }
  }
  throw new Error('unreachable');
}

async function main() {
  console.log('Seeding taxonomy...');
  const categories: Record<string, string> = {};
  for (const name of CATEGORIES) {
    const c = await db.category.upsert({ where: { name }, update: {}, create: { name, slug: slugify(name) } });
    categories[name] = c.id;
  }
  const brands: Record<string, string> = {};
  for (const name of BRANDS) {
    const b = await db.brand.upsert({ where: { name }, update: {}, create: { name, slug: slugify(name) } });
    brands[name] = b.id;
  }
  const vibes: Record<string, string> = {};
  for (const name of VIBES) {
    const v = await db.vibe.upsert({ where: { name }, update: {}, create: { name, slug: slugify(name) } });
    vibes[name] = v.id;
  }

  console.log('Seeding sellers...');
  const passwordHash = await hashPassword('DemoPassword123');
  const sellerIds: string[] = [];

  for (const seller of SELLERS) {
    const user = await db.user.upsert({
      where: { email: `${seller.username}@jillukloset.com` },
      update: {},
      create: {
        email: `${seller.username}@jillukloset.com`,
        passwordHash,
        emailVerified: new Date(),
        profile: {
          create: {
            username: seller.username,
            displayName: seller.name,
            bio: seller.bio,
            location: seller.location,
          },
        },
      },
    });
    sellerIds.push(user.id);
  }

  console.log('Clearing previously seeded listings...');
  await db.listing.deleteMany({ where: { sellerId: { in: sellerIds } } });

  console.log('Seeding listings (downloading placeholder photos into object storage)...');
  let seed = 1;
  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i]!;
    const sellerId = pick(sellerIds, i);
    const slug = slugify(product.title);

    const price = randomInRange(product.priceRange, seed++);
    const condition = pick(CONDITIONS, seed++);
    const size = pick(SIZES, seed++);
    const location = pick(LOCATIONS, seed++);
    const daysAgo = (seed * 7) % 30;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    console.log(`  - ${product.title}`);
    const images = await Promise.all(
      Array.from({ length: 4 }).map((_, order) => seedImage(slug, order)),
    );

    await db.listing.create({
      data: {
        sellerId,
        title: product.title,
        description: product.description,
        price,
        categoryId: categories[product.category]!,
        brandId: product.brand ? brands[product.brand] : undefined,
        size,
        condition: condition as never,
        gender: product.gender as never,
        location,
        status: 'ACTIVE',
        publishedAt: createdAt,
        createdAt,
        viewCount: (seed * 13) % 400,
        vibes: { create: product.vibes.map((v) => ({ vibeId: vibes[v]! })) },
        images: {
          create: images.map((image, order) => ({
            objectKey: image.objectKey,
            url: image.url,
            order,
            isPrimary: order === 0,
          })),
        },
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
