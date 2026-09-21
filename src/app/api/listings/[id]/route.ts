import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { AppError } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { auth } from '@/auth';
import { requireSession } from '@/lib/current-user';
import { updateListingSchema } from '@/modules/listings/schemas';
import { findListingById } from '@/modules/listings/repository';
import { removeListing, updateExistingListing } from '@/modules/listings/service';

const PUBLIC_STATUSES = ['ACTIVE', 'RESERVED', 'SOLD'];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listing = await findListingById(id);
    if (!listing) throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);

    const session = await auth();
    const isOwner = session?.user?.id === listing.sellerId;
    const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
    const isPublic = PUBLIC_STATUSES.includes(listing.status);
    if (!isPublic && !isOwner && !isStaff) {
      // Same visibility rule as the /listing/[id] page — a draft/archived listing does not exist
      // as far as anyone else is concerned, so 404 rather than 403 (don't confirm it exists).
      throw new AppError('LISTING_NOT_FOUND', 'Listing not found.', 404);
    }

    return NextResponse.json(ok(listing));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const input = updateListingSchema.parse(body);
    const listing = await updateExistingListing(id, session.user.id, input);
    return NextResponse.json(ok(listing));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await removeListing(id, session.user.id);
    return NextResponse.json(ok({ deleted: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}
