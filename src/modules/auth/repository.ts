import { db } from '@/lib/db';

export function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email }, include: { profile: true } });
}

export function findUserByUsername(username: string) {
  return db.profile.findUnique({ where: { username } });
}

export function createUserWithProfile(params: {
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
}) {
  return db.user.create({
    data: {
      email: params.email,
      passwordHash: params.passwordHash,
      profile: {
        create: {
          username: params.username,
          displayName: params.displayName,
        },
      },
    },
    include: { profile: true },
  });
}

export function markEmailVerified(userId: string) {
  return db.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
}

export function updatePasswordHash(userId: string, passwordHash: string) {
  return db.user.update({ where: { id: userId }, data: { passwordHash } });
}
