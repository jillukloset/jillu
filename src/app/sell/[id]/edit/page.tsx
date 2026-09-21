import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppError } from '@/lib/api-result';
import { getListingForOwner } from '@/modules/listings/service';
import { listBrands, listCategories, listVibes } from '@/modules/taxonomy/repository';
import { SellWizard } from '../../sell-wizard';

export const metadata: Metadata = { title: 'Edit listing — Jillu Kloset' };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/sell/${id}/edit`);

  let listing;
  try {
    listing = await getListingForOwner(id, session.user.id);
  } catch (error) {
    if (error instanceof AppError) notFound();
    throw error;
  }

  const [categories, brands, vibes] = await Promise.all([listCategories(), listBrands(), listVibes()]);

  return (
    <div className="mx-auto max-w-2xl px-gutter py-10">
      <h1 className="mb-1 font-display text-3xl">Edit listing</h1>
      <p className="mb-8 text-sm text-muted">Update your piece&rsquo;s details.</p>
      <SellWizard categories={categories} brands={brands} vibes={vibes} existingListing={listing} />
    </div>
  );
}
