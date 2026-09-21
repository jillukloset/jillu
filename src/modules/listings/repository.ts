import { db } from '@/lib/db';

// `seller` is a User relation and must use an explicit `select` here, never a bare `include`:
// this listing (and its seller) is served to anonymous/public callers, and Prisma's `include`
// on a relation returns every column on that model — including `passwordHash` — verbatim into
// the JSON response.
const publicSellerSelect = {
  select: {
    id: true,
    profile: { select: { username: true, displayName: true, avatarUrl: true, bio: true, location: true } },
  },
};

export const listingDetailInclude = {
  images: { orderBy: { order: 'asc' as const } },
  category: true,
  brand: true,
  vibes: { include: { vibe: true } },
  seller: publicSellerSelect,
};

export function findListingById(id: string) {
  return db.listing.findUnique({ where: { id }, include: listingDetailInclude });
}

export function createListing(sellerId: string, data: {
  status: 'DRAFT' | 'ACTIVE';
  title: string;
  description: string;
  price: number;
  categoryId: string;
  brandId?: string;
  size: string;
  condition: string;
  gender: string;
  color?: string;
  location: string;
  vibeIds: string[];
  images: { objectKey: string; url: string; order: number; isPrimary: boolean }[];
}) {
  return db.listing.create({
    data: {
      sellerId,
      status: data.status,
      title: data.title,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      brandId: data.brandId,
      size: data.size,
      condition: data.condition as never,
      gender: data.gender as never,
      color: data.color,
      location: data.location,
      publishedAt: data.status === 'ACTIVE' ? new Date() : null,
      vibes: { create: data.vibeIds.map((vibeId) => ({ vibeId })) },
      images: {
        create: data.images.map((image) => ({
          objectKey: image.objectKey,
          url: image.url,
          order: image.order,
          isPrimary: image.isPrimary,
        })),
      },
    },
    include: listingDetailInclude,
  });
}

export async function updateListing(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    price: number;
    categoryId: string;
    brandId: string | null;
    size: string;
    condition: string;
    gender: string;
    color: string | null;
    location: string;
    vibeIds: string[];
    images: { objectKey: string; url: string; order: number; isPrimary: boolean }[];
    status: string;
    publishedAt: Date | null;
    soldAt: Date | null;
  }>,
) {
  const { vibeIds, images, ...rest } = data;

  return db.$transaction(async (tx) => {
    if (vibeIds) {
      await tx.listingVibe.deleteMany({ where: { listingId: id } });
    }
    if (images) {
      await tx.listingImage.deleteMany({ where: { listingId: id } });
    }

    return tx.listing.update({
      where: { id },
      data: {
        ...rest,
        condition: rest.condition as never,
        gender: rest.gender as never,
        status: rest.status as never,
        ...(vibeIds ? { vibes: { create: vibeIds.map((vibeId) => ({ vibeId })) } } : {}),
        ...(images
          ? {
              images: {
                create: images.map((image) => ({
                  objectKey: image.objectKey,
                  url: image.url,
                  order: image.order,
                  isPrimary: image.isPrimary,
                })),
              },
            }
          : {}),
      },
      include: listingDetailInclude,
    });
  });
}

export function deleteListing(id: string) {
  return db.listing.delete({ where: { id } });
}

export function listSellerListings(sellerId: string, status: 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED') {
  return db.listing.findMany({
    where: { sellerId, status },
    orderBy: { updatedAt: 'desc' },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });
}

export function incrementViewCount(id: string) {
  return db.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => undefined);
}
