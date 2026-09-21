import { z } from 'zod';
import { ALLOWED_IMAGE_TYPES } from '@/lib/media-config';

export const presignRequestSchema = z.object({
  folder: z.enum(['avatars', 'listings']),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
});
export type PresignRequestInput = z.infer<typeof presignRequestSchema>;

export const confirmAvatarSchema = z.object({
  objectKey: z.string().min(1),
});
