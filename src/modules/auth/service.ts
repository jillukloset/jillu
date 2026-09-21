import { AppError } from '@/lib/api-result';
import { passwordResetEmail, sendMail, verificationEmail } from '@/lib/mail';
import type { ForgotPasswordInput, ResetPasswordInput, SignupInput } from './schemas';
import { hashPassword, verifyPassword } from './password';
import {
  createUserWithProfile,
  findUserByEmail,
  findUserByUsername,
  markEmailVerified,
  updatePasswordHash,
} from './repository';
import {
  consumePasswordResetToken,
  consumeVerificationToken,
  createPasswordResetToken,
  createVerificationToken,
} from './tokens';

const appUrl = () => process.env.APP_URL ?? 'http://localhost:3000';

export async function signup(input: SignupInput) {
  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) {
    throw new AppError('EMAIL_TAKEN', 'An account with that email already exists.');
  }
  const existingUsername = await findUserByUsername(input.username);
  if (existingUsername) {
    throw new AppError('USERNAME_TAKEN', 'That username is already claimed.');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUserWithProfile({
    email: input.email,
    passwordHash,
    username: input.username,
    displayName: input.displayName,
  });

  const token = await createVerificationToken(user.id);
  const link = `${appUrl()}/verify-email?token=${token}`;
  const email = verificationEmail(link);
  await sendMail({ to: user.email, ...email });

  return user;
}

export async function verifyEmail(token: string) {
  const record = await consumeVerificationToken(token);
  if (!record) {
    throw new AppError('INVALID_TOKEN', 'This verification link is invalid or has expired.');
  }
  await markEmailVerified(record.userId);
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await findUserByEmail(input.email);
  // Do not reveal whether the email exists.
  if (!user || !user.passwordHash) return;

  const token = await createPasswordResetToken(user.id);
  const link = `${appUrl()}/reset-password?token=${token}`;
  const email = passwordResetEmail(link);
  await sendMail({ to: user.email, ...email });
}

export async function resetPassword(input: ResetPasswordInput) {
  const record = await consumePasswordResetToken(input.token);
  if (!record) {
    throw new AppError('INVALID_TOKEN', 'This reset link is invalid or has expired.');
  }
  const passwordHash = await hashPassword(input.password);
  await updatePasswordHash(record.userId, passwordHash);
}

export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user || !user.passwordHash) return null;
  if (user.status === 'SUSPENDED') {
    throw new AppError('ACCOUNT_SUSPENDED', 'This account has been suspended.');
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  if (!user.emailVerified) {
    throw new AppError('EMAIL_NOT_VERIFIED', 'Please verify your email before logging in.');
  }
  return user;
}
