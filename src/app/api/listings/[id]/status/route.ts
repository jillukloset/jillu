import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { changeListingStatus } from '@/modules/listings/service';

const schema = z.object({ status: z.enum(['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED']) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { status } = schema.parse(body);
    const listing = await changeListingStatus(id, session.user.id, status);
    return NextResponse.json(ok(listing));
  } catch (error) {
    return handleRouteError(error);
  }
}
