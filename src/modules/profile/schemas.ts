import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'Enter a display name').max(50),
  bio: z.string().trim().max(280, 'Keep your bio under 280 characters').optional().or(z.literal('')),
  location: z.string().trim().max(80).optional().or(z.literal('')),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
