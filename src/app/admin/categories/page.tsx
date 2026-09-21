import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/require-role';
import { listTaxonomy } from '@/modules/admin/taxonomy-service';
import { TaxonomyManager } from '@/components/admin/taxonomy-manager';

export const metadata: Metadata = { title: 'Admin · Categories — Jillu Kloset' };

export default async function AdminCategoriesPage() {
  await requireAdminPage('/admin/categories');
  const entries = await listTaxonomy('CATEGORY');

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Categories</h1>
      <TaxonomyManager kindPath="categories" entries={entries} />
    </div>
  );
}
