import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { markConversationRead } from '@/modules/messaging/service';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await markConversationRead(id, session.user.id);
    return NextResponse.json(ok({ read: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}
