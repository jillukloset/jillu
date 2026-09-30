import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendMessageSchema } from '@/modules/messaging/schemas';
import { encodeMessagePollOrigin } from '@/modules/messaging/cursors';
import { getConversationMessages, getNewMessagesSince, sendMessage } from '@/modules/messaging/service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    if (request.nextUrl.searchParams.has('since')) {
      const since = request.nextUrl.searchParams.get('since') ?? '';
      if (!since) {
        return NextResponse.json(ok({ items: [], sinceCursor: encodeMessagePollOrigin() }));
      }
      const result = await getNewMessagesSince(id, session.user.id, since);
      return NextResponse.json(ok(result));
    }

    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const result = await getConversationMessages(id, session.user.id, cursor);
    return NextResponse.json(ok(result));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`message:${session.user.id}`, RATE_LIMITS.messaging.limit, RATE_LIMITS.messaging.windowMs);
    const { id } = await params;
    const body = await request.json();
    const { body: text } = sendMessageSchema.parse(body);
    const message = await sendMessage(id, session.user.id, text);
    return NextResponse.json(ok(message), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
