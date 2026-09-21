import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { getConversationDetail } from '@/modules/messaging/service';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const conversation = await getConversationDetail(id, session.user.id);
    return NextResponse.json(ok(conversation));
  } catch (error) {
    return handleRouteError(error);
  }
}
