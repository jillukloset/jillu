import { z } from 'zod';

const REASONS = ['SPAM', 'COUNTERFEIT', 'PROHIBITED_ITEM', 'MISLEADING', 'SCAM', 'INAPPROPRIATE_CONTENT', 'OTHER'] as const;

export const createReportSchema = z.object({
  reason: z.enum(REASONS),
  details: z.string().trim().max(1000).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;
