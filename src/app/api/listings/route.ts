import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { createListingSchema } from '@/modules/listings/schemas';
import { createNewListing } from '@/modules/listings/service';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = createListingSchema.parse(body);
    const listing = await createNewListing(session.user.id, input);
    return NextResponse.json(ok(listing), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
