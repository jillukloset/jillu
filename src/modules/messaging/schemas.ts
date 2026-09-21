import { z } from 'zod';

export const startConversationSchema = z.object({
  listingId: z.string().min(1),
});
export type StartConversationInput = z.infer<typeof startConversationSchema>;

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, 'Write a message first').max(2000, 'Message is too long'),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
