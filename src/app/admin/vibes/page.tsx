import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/require-role';
import { listTaxonomy } from '@/modules/admin/taxonomy-service';
import { TaxonomyManager } from '@/components/admin/taxonomy-manager';

export const metadata: Metadata = { title: 'Admin · Vibes — Jillu Kloset' };

export default async function AdminVibesPage() {
  await requireAdminPage('/admin/vibes');
  const entries = await listTaxonomy('VIBE');

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Vibes</h1>
      <TaxonomyManager kindPath="vibes" entries={entries} />
    </div>
  );
}
