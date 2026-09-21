import { z } from 'zod';

const usernamePattern = /^[a-z0-9_.]{3,24}$/;

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(usernamePattern, 'Use 3-24 letters, numbers, dots or underscores'),
  displayName: z.string().trim().min(1, 'Enter a display name').max(50),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
