import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { AppError } from '@/lib/api-result';
import { validateProductionEnv } from '@/lib/env';
import { hitRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { verifyCredentials } from '@/modules/auth/service';
import { generateUniqueUsername } from '@/modules/auth/username';
import {
  AccountSuspendedError,
  EmailNotVerifiedError,
  InvalidCredentialsError,
  RateLimitedError,
} from '@/modules/auth/auth-errors';

validateProductionEnv();

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') {
          throw new InvalidCredentialsError();
        }

        const limit = hitRateLimit(`login:${email.toLowerCase()}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);
        if (!limit.allowed) {
          throw new RateLimitedError();
        }

        try {
          const user = await verifyCredentials(email, password);
          if (!user) throw new InvalidCredentialsError();
          return {
            id: user.id,
            email: user.email,
            name: user.profile?.displayName ?? user.email,
          };
        } catch (error) {
          if (error instanceof AppError) {
            if (error.code === 'EMAIL_NOT_VERIFIED') throw new EmailNotVerifiedError();
            if (error.code === 'ACCOUNT_SUSPENDED') throw new AccountSuspendedError();
          }
          throw new InvalidCredentialsError();
        }
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email) return true;

      const existing = await db.user.findUnique({
        where: { email: user.email },
        include: { profile: true },
      });

      if (existing) {
        if (existing.status === 'SUSPENDED') return false;
        if (!existing.emailVerified) {
          await db.user.update({
            where: { id: existing.id },
            data: { emailVerified: new Date() },
          });
        }
        return true;
      }

      const username = await generateUniqueUsername(user.name ?? user.email);
      await db.user.create({
        data: {
          email: user.email,
          emailVerified: new Date(),
          profile: {
            create: {
              username,
              displayName: user.name ?? username,
              avatarUrl: user.image ?? undefined,
            },
          },
        },
      });
      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const dbUser = await db.user.findUnique({
        where: { email: token.email },
        include: { profile: true },
      });
      if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.status = dbUser.status;
        token.username = dbUser.profile?.username ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.username = token.username as string | null;
      }
      return session;
    },
  },
});

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
