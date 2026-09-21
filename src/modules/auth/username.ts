import { db } from '@/lib/db';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/@.*$/, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) || 'jillu';
}

export async function generateUniqueUsername(seed: string) {
  const base = slugify(seed);
  let candidate = base;
  let suffix = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.profile.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
}
