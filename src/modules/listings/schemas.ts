import { z } from 'zod';
import { MAX_LISTING_IMAGES, MIN_LISTING_IMAGES } from '@/lib/media-config';

const CONDITIONS = [
  'NEW_WITH_TAGS',
  'NEW_WITHOUT_TAGS',
  'LIKE_NEW',
  'EXCELLENT',
  'GOOD',
  'VISIBLE_WEAR',
] as const;

const GENDERS = ['WOMEN', 'MEN', 'UNISEX'] as const;

export const listingImageInputSchema = z.object({
  objectKey: z.string().min(1),
  order: z.number().int().min(0),
  isPrimary: z.boolean(),
});

export const createListingSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE']),
  title: z.string().trim().min(3, 'Title is too short').max(100),
  description: z.string().trim().min(10, 'Add a bit more detail').max(2000),
  price: z.number().int().min(1, 'Enter a price').max(10_000_000),
  categoryId: z.string().min(1, 'Choose a category'),
  brandId: z.string().min(1).optional(),
  size: z.string().trim().min(1, 'Enter a size').max(20),
  condition: z.enum(CONDITIONS),
  gender: z.enum(GENDERS),
  color: z.string().trim().max(40).optional(),
  location: z.string().trim().min(1, 'Enter a location').max(80),
  vibeIds: z.array(z.string()).max(6).default([]),
  images: z
    .array(listingImageInputSchema)
    .min(MIN_LISTING_IMAGES, `Add at least ${MIN_LISTING_IMAGES} photos`)
    .max(MAX_LISTING_IMAGES, `Add at most ${MAX_LISTING_IMAGES} photos`),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED']).optional(),
});
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
