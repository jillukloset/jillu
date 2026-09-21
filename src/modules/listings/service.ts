import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { MAX_LISTING_IMAGE_BYTES } from '@/lib/media-config';
import { ensureOwnedObjectKey, verifyUploadedObject } from '@/modules/media/service';
import { publicUrlForKey } from '@/lib/s3';
import { notifyListingSold } from '@/modules/notifications/service';
import type { CreateListingInput, UpdateListingInput } from './schemas';
import {
  createListing as createListingRow,
  deleteListing as deleteListingRow,
  findListingById,
  updateListing as updateListingRow,
} from './repository';

async function resolveImages(userId: string, images: CreateListingInput['images']) {
  for (const image of images) {
    ensureOwnedObjectKey(image.objectKey, userId, 'listings');
  }
  await Promise.all(images.map((image) => verifyUploadedObject(image.objectKey, MAX_LISTING_IMAGE_BYTES)));
  return images.map((image) => ({ ...image, url: publicUrlForKey(image.objectKey) }));
}

async function assertTaxonomyExists(categoryId: string, brandId?: string, vibeIds: string[] = []) {
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError('INVALID_CATEGORY', 'Choose a valid category.');

  if (brandId) {
    const brand = await db.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new AppError('INVALID_BRAND', 'Choose a valid brand.');
  }

  if (vibeIds.length) {
    const count = await db.vibe.count({ where: { id: { in: vibeIds } } });
    if (count !== vibeIds.length) throw new AppError('INVALID_VIBE', 'One of the selected vibes is invalid.');
  }
}

export async function createNewListing(sellerId: string, input: CreateListingInput) {
  await assertTaxonomyExists(input.categoryId, input.brandId, input.vibeIds);
  const images = await resolveImages(sellerId, input.images);

  return createListingRow(sellerId, { ...input, images });
}

async function requireOwnedListing(listingId: string, userId: string) {
  const listing = await findListingById(listingId);
  if (!listing) throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);
  if (listing.sellerId !== userId) {
    throw new AppError('FORBIDDEN', 'You do not have permission to modify this listing.', 403);
  }
  return listing;
}

export async function updateExistingListing(listingId: string, userId: string, input: UpdateListingInput) {
  const listing = await requireOwnedListing(listingId, userId);

  if (input.categoryId || input.brandId || input.vibeIds) {
    await assertTaxonomyExists(
      input.categoryId ?? listing.categoryId,
      input.brandId,
      input.vibeIds ?? [],
    );
  }

  const images = input.images ? await resolveImages(userId, input.images) : undefined;

  return updateListingRow(listingId, {
    ...input,
    images,
    publishedAt: input.status === 'ACTIVE' && !listing.publishedAt ? new Date() : undefined,
    soldAt: input.status === 'SOLD' ? new Date() : undefined,
  });
}

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['RESERVED', 'SOLD', 'ARCHIVED'],
  RESERVED: ['ACTIVE', 'SOLD', 'ARCHIVED'],
  SOLD: ['ARCHIVED'],
  ARCHIVED: ['ACTIVE'],
};

export async function changeListingStatus(listingId: string, userId: string, nextStatus: string) {
  const listing = await requireOwnedListing(listingId, userId);

  const allowed = ALLOWED_STATUS_TRANSITIONS[listing.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError('INVALID_STATUS_TRANSITION', `Cannot move a ${listing.status} listing to ${nextStatus}.`);
  }

  const updated = await updateListingRow(listingId, {
    status: nextStatus,
    publishedAt: nextStatus === 'ACTIVE' && !listing.publishedAt ? new Date() : undefined,
    soldAt: nextStatus === 'SOLD' ? new Date() : null,
  });

  if (nextStatus === 'SOLD') {
    await notifyListingSold(listing.id, listing.title, userId);
  }

  return updated;
}

export async function removeListing(listingId: string, userId: string) {
  const listing = await requireOwnedListing(listingId, userId);
  if (listing.status !== 'DRAFT') {
    throw new AppError('CANNOT_DELETE_PUBLISHED', 'Archive a published listing instead of deleting it.');
  }
  await deleteListingRow(listingId);
}

export async function getListingForOwner(listingId: string, userId: string) {
  return requireOwnedListing(listingId, userId);
}
