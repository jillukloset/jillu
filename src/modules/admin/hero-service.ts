import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { recordAuditLog } from './audit';
import { deleteObject, ensureOwnedObjectKey, verifyUploadedObject } from '@/modules/media/service';
import { publicUrlForKey } from '@/lib/s3';
import { MAX_HERO_IMAGE_BYTES } from '@/lib/media-config';

export const HERO_CONFIG_ID = 'main';

export function getHeroConfig() {
  return db.heroConfig.findUnique({ where: { id: HERO_CONFIG_ID } });
}

export async function updateHeroConfig(
  actorId: string,
  data: {
    isActive?: boolean;
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    overlayOpacity?: number;
    textAlign?: 'left' | 'center';
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    backgroundObjectKey?: string | null;
  },
) {
  const existing = await getHeroConfig();

  const updates: Record<string, unknown> = {};
  for (const key of [
    'isActive',
    'eyebrow',
    'title',
    'subtitle',
    'backgroundColor',
    'overlayOpacity',
    'textAlign',
    'primaryCtaLabel',
    'primaryCtaHref',
    'secondaryCtaLabel',
    'secondaryCtaHref',
  ] as const) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (data.backgroundObjectKey !== undefined) {
    if (data.backgroundObjectKey) {
      ensureOwnedObjectKey(data.backgroundObjectKey, actorId, 'hero');
      await verifyUploadedObject(data.backgroundObjectKey, MAX_HERO_IMAGE_BYTES);
      updates.backgroundObjectKey = data.backgroundObjectKey;
      updates.backgroundUrl = publicUrlForKey(data.backgroundObjectKey);
    } else {
      updates.backgroundObjectKey = null;
      updates.backgroundUrl = null;
    }
  }

  const updated = await db.heroConfig.upsert({
    where: { id: HERO_CONFIG_ID },
    create: { id: HERO_CONFIG_ID, ...updates } as never,
    update: updates,
  });

  if (data.backgroundObjectKey && existing?.backgroundObjectKey) {
    deleteObject(existing.backgroundObjectKey).catch(() => undefined);
  }

  await recordAuditLog(actorId, 'HERO_UPDATED', 'HERO_CONFIG', HERO_CONFIG_ID, updates as never);
  return updated;
}

export function assertValidCtaHref(href: string) {
  if (!href.startsWith('/') && !/^https:\/\//.test(href)) {
    throw new AppError('INVALID_HREF', 'CTA links must start with "/" or "https://".');
  }
}
