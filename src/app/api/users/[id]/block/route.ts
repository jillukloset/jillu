import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { blockUser, unblockUser } from '@/modules/social/block-service';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await blockUser(session.user.id, id);
    return NextResponse.json(ok({ blocked: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await unblockUser(session.user.id, id);
    return NextResponse.json(ok({ blocked: false }));
  } catch (error) {
    return handleRouteError(error);
  }
}
