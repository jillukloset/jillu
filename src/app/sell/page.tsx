import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listBrands, listCategories, listVibes } from '@/modules/taxonomy/repository';
import { SellWizard } from './sell-wizard';

export const metadata: Metadata = { title: 'Sell something — Jillu Kloset' };

export default async function SellPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/sell');

  const [categories, brands, vibes] = await Promise.all([listCategories(), listBrands(), listVibes()]);

  return (
    <div className="mx-auto max-w-2xl px-gutter py-10">
      <h1 className="mb-1 font-display text-3xl">Sell something</h1>
      <p className="mb-8 text-sm text-muted">Give a piece from your closet another story.</p>
      <SellWizard categories={categories} brands={brands} vibes={vibes} />
    </div>
  );
}
