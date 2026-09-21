import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/require-role';
import { listTaxonomy } from '@/modules/admin/taxonomy-service';
import { TaxonomyManager } from '@/components/admin/taxonomy-manager';

export const metadata: Metadata = { title: 'Admin · Brands — Jillu Kloset' };

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireAdminPage('/admin/brands');
  const { search } = await searchParams;
  const entries = await listTaxonomy('BRAND', search);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Brands</h1>
      <form method="GET" className="mb-4">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search brands…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </form>
      <TaxonomyManager kindPath="brands" entries={entries} />
    </div>
  );
}
