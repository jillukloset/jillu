import { AppError } from '@/lib/api-result';

const KIND_MAP: Record<string, 'CATEGORY' | 'BRAND' | 'VIBE'> = {
  categories: 'CATEGORY',
  brands: 'BRAND',
  vibes: 'VIBE',
};

export function resolveTaxonomyKind(param: string) {
  const kind = KIND_MAP[param];
  if (!kind) throw new AppError('INVALID_TAXONOMY_KIND', 'Unknown taxonomy type.', 404);
  return kind;
}
