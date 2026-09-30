import { AppError } from '@/lib/api-result';
import { db } from '@/lib/db';
import { recordAuditLog } from './audit';
import { deleteObject, ensureOwnedObjectKey, verifyUploadedObject } from '@/modules/media/service';
import { publicUrlForKey } from '@/lib/s3';
import { MAX_VIBE_BANNER_BYTES } from '@/lib/media-config';

type TaxonomyKind = 'CATEGORY' | 'BRAND' | 'VIBE';

const DELEGATES = {
  CATEGORY: db.category,
  BRAND: db.brand,
  VIBE: db.vibe,
} as const;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function listTaxonomy(kind: TaxonomyKind, search?: string) {
  const delegate = DELEGATES[kind];
  return (delegate as typeof db.category).findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
    orderBy: { name: 'asc' },
  });
}

export async function createTaxonomyEntry(kind: TaxonomyKind, actorId: string, name: string) {
  const delegate = DELEGATES[kind] as typeof db.category;
  const slug = slugify(name);

  const existing = await delegate.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) {
    throw new AppError('DUPLICATE_NAME', `A ${kind.toLowerCase()} with that name already exists.`);
  }

  const created = await delegate.create({ data: { name, slug } });
  await recordAuditLog(actorId, `${kind}_CREATED`, kind, created.id, { name });
  return created;
}

export async function renameTaxonomyEntry(kind: TaxonomyKind, actorId: string, id: string, name: string) {
  const delegate = DELEGATES[kind] as typeof db.category;
  const existing = await delegate.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Not found.', 404);

  const slug = slugify(name);
  const duplicate = await delegate.findFirst({ where: { OR: [{ name }, { slug }], NOT: { id } } });
  if (duplicate) {
    throw new AppError('DUPLICATE_NAME', `A ${kind.toLowerCase()} with that name already exists.`);
  }

  const updated = await delegate.update({ where: { id }, data: { name, slug } });
  await recordAuditLog(actorId, `${kind}_UPDATED`, kind, id, { from: existing.name, to: name });
  return updated;
}

export async function setTaxonomyActive(kind: TaxonomyKind, actorId: string, id: string, isActive: boolean) {
  const delegate = DELEGATES[kind] as typeof db.category;
  const existing = await delegate.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Not found.', 404);

  const updated = await delegate.update({ where: { id }, data: { isActive } });
  await recordAuditLog(actorId, `${kind}_UPDATED`, kind, id, { name: existing.name, isActive });
  return updated;
}

export async function updateVibe(
  actorId: string,
  id: string,
  data: {
    description?: string | null;
    accentColor?: string | null;
    bannerObjectKey?: string | null;
  },
) {
  const existing = await db.vibe.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Vibe not found.', 404);

  const updates: Record<string, unknown> = {};

  if (data.description !== undefined) {
    updates.description = data.description;
  }
  if (data.accentColor !== undefined) {
    updates.accentColor = data.accentColor;
  }
  if (data.bannerObjectKey !== undefined) {
    if (data.bannerObjectKey) {
      ensureOwnedObjectKey(data.bannerObjectKey, actorId, 'vibes');
      await verifyUploadedObject(data.bannerObjectKey, MAX_VIBE_BANNER_BYTES);
      updates.bannerObjectKey = data.bannerObjectKey;
      updates.bannerUrl = publicUrlForKey(data.bannerObjectKey);
    } else {
      updates.bannerObjectKey = null;
      updates.bannerUrl = null;
    }
  }

  const updated = await db.vibe.update({ where: { id }, data: updates });

  if (data.bannerObjectKey !== undefined && data.bannerObjectKey && existing.bannerObjectKey) {
    deleteObject(existing.bannerObjectKey).catch(() => undefined);
  }

  await recordAuditLog(actorId, 'VIBE_UPDATED', 'VIBE', id, { name: existing.name, ...updates });
  return updated;
}
