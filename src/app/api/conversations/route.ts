import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { startConversationSchema } from '@/modules/messaging/schemas';
import { listMyConversations, startOrGetConversation } from '@/modules/messaging/service';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { listingId } = startConversationSchema.parse(body);
    const conversation = await startOrGetConversation(session.user.id, listingId);
    return NextResponse.json(ok(conversation), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const result = await listMyConversations(session.user.id, cursor);
    return NextResponse.json(ok(result));
  } catch (error) {
    return handleRouteError(error);
  }
}
