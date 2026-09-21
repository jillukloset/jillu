import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';

const VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const RESET_TTL_MS = 1000 * 60 * 60; // 1h

function generateToken() {
  return randomBytes(32).toString('hex');
}

export async function createVerificationToken(userId: string) {
  const token = generateToken();
  await db.verificationToken.deleteMany({ where: { userId } });
  await db.verificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
  });
  return token;
}

export async function consumeVerificationToken(token: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) return null;
  await db.verificationToken.delete({ where: { id: record.id } });
  return record;
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  await db.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });
  await db.passwordResetToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  return token;
}

export async function consumePasswordResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record;
}
