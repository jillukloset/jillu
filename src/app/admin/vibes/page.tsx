import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/require-role';
import { db } from '@/lib/db';
import { VibeManager } from '@/components/admin/vibe-manager';

export const metadata: Metadata = { title: 'Admin · Vibes' };

export default async function AdminVibesPage() {
  await requireAdminPage('/admin/vibes');
  const entries = await db.vibe.findMany({ orderBy: { name: 'asc' } });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Vibes</h1>
      <p className="mb-6 text-sm text-slate-500">Manage vibe banners, descriptions, and accent colors for the storefront.</p>
      <VibeManager entries={entries} />
    </div>
  );
}
