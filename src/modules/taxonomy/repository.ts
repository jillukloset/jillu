import { db } from '@/lib/db';

export function listCategories() {
  return db.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
}

export function listBrands() {
  return db.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
}

export function listVibes() {
  return db.vibe.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
}
