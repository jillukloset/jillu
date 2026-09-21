import type { Metadata } from 'next';
import Link from 'next/link';
import { getListingsPageForAdmin } from '@/modules/admin/listings-service';
import { listCategories } from '@/modules/taxonomy/repository';
import { ListingRowActions } from '@/components/admin/listing-row-actions';
import { Price } from '@/components/ui/price';

export const metadata: Metadata = { title: 'Admin · Listings — Jillu Kloset' };

const STATUSES = ['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED'];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; categoryId?: string; sellerId?: string; cursor?: string }>;
}) {
  const params = await searchParams;
  const [{ items, hasMore }, categories] = await Promise.all([
    getListingsPageForAdmin(
      { search: params.search, status: params.status, categoryId: params.categoryId, sellerId: params.sellerId },
      params.cursor,
    ),
    listCategories(),
  ]);

  const nextParams = new URLSearchParams();
  if (params.search) nextParams.set('search', params.search);
  if (params.status) nextParams.set('status', params.status);
  if (params.categoryId) nextParams.set('categoryId', params.categoryId);
  if (params.sellerId) nextParams.set('sellerId', params.sellerId);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Listings</h1>

      <form method="GET" className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search title…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <select name="status" defaultValue={params.status ?? ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={params.categoryId ?? ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="py-2">Listing</th>
            <th className="py-2">Seller</th>
            <th className="py-2">Category</th>
            <th className="py-2">Price</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((listing) => (
            <tr key={listing.id} className="border-b border-slate-100">
              <td className="py-2">
                <Link href={`/listing/${listing.id}`} className="font-medium text-slate-900 hover:underline">
                  {listing.title}
                </Link>
              </td>
              <td className="py-2 text-slate-600">
                {listing.seller.profile ? (
                  <Link href={`/closet/${listing.seller.profile.username}`} className="hover:underline">
                    @{listing.seller.profile.username}
                  </Link>
                ) : (
                  '—'
                )}
              </td>
              <td className="py-2 text-slate-600">{listing.category.name}</td>
              <td className="py-2 text-slate-600">
                <Price amount={listing.price} currency={listing.currency} />
              </td>
              <td className="py-2 text-slate-600">{listing.status}</td>
              <td className="py-2 text-right">
                <ListingRowActions listingId={listing.id} status={listing.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {items.length === 0 ? <p className="py-6 text-sm text-slate-500">No listings match these filters.</p> : null}

      {hasMore && items.at(-1) ? (
        <div className="mt-4">
          <Link
            href={`/admin/listings?${(() => {
              const p = new URLSearchParams(nextParams);
              p.set('cursor', items.at(-1)!.id);
              return p.toString();
            })()}`}
            className="text-sm font-semibold text-slate-700 underline"
          >
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
