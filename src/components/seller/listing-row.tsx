'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Price } from '@/components/ui/price';
import { buttonClassName } from '@/components/ui/button';

type Row = {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  primaryImageUrl: string | null;
};

const ACTIONS: Record<string, { label: string; nextStatus: string; variant?: 'primary' | 'secondary' | 'danger' }[]> = {
  DRAFT: [{ label: 'Publish', nextStatus: 'ACTIVE' }],
  ACTIVE: [
    { label: 'Mark reserved', nextStatus: 'RESERVED', variant: 'secondary' },
    { label: 'Mark sold', nextStatus: 'SOLD' },
    { label: 'Archive', nextStatus: 'ARCHIVED', variant: 'danger' },
  ],
  RESERVED: [
    { label: 'Back to active', nextStatus: 'ACTIVE', variant: 'secondary' },
    { label: 'Mark sold', nextStatus: 'SOLD' },
    { label: 'Archive', nextStatus: 'ARCHIVED', variant: 'danger' },
  ],
  SOLD: [{ label: 'Archive', nextStatus: 'ARCHIVED', variant: 'secondary' }],
  ARCHIVED: [{ label: 'Reactivate', nextStatus: 'ACTIVE' }],
};

export function ListingRow({ listing }: { listing: Row }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changeStatus = (nextStatus: string) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/listings/${listing.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Could not update this listing.');
        return;
      }
      router.refresh();
    });
  };

  const deleteDraft = () => {
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'Could not delete this draft.');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
          {listing.primaryImageUrl ? (
            <Image src={listing.primaryImageUrl} alt={listing.title} fill className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{listing.title}</p>
          <Price amount={listing.price} currency={listing.currency} className="text-sm text-muted" />
        </div>
        <Link href={`/listing/${listing.id}`} className={buttonClassName('ghost', 'sm')}>
          View
        </Link>
        {listing.status !== 'SOLD' ? (
          <Link href={`/sell/${listing.id}/edit`} className={buttonClassName('ghost', 'sm')}>
            Edit
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 pl-[68px]">
        {(ACTIONS[listing.status] ?? []).map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={pending}
            onClick={() => changeStatus(action.nextStatus)}
            className={buttonClassName(action.variant ?? 'secondary', 'sm')}
          >
            {action.label}
          </button>
        ))}
        {listing.status === 'DRAFT' ? (
          <button type="button" disabled={pending} onClick={deleteDraft} className={buttonClassName('danger', 'sm')}>
            Delete
          </button>
        ) : null}
      </div>
      {error ? <p className="pl-[68px] text-xs text-danger">{error}</p> : null}
    </div>
  );
}
