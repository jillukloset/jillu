import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { likeListing, unlikeListing } from '@/modules/social/like-service';
import { countLikes } from '@/modules/social/like-repository';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`social:${session.user.id}`, RATE_LIMITS.socialAction.limit, RATE_LIMITS.socialAction.windowMs);
    const { id } = await params;
    await likeListing(session.user.id, id);
    const count = await countLikes(id);
    return NextResponse.json(ok({ liked: true, count }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`social:${session.user.id}`, RATE_LIMITS.socialAction.limit, RATE_LIMITS.socialAction.windowMs);
    const { id } = await params;
    await unlikeListing(session.user.id, id);
    const count = await countLikes(id);
    return NextResponse.json(ok({ liked: false, count }));
  } catch (error) {
    return handleRouteError(error);
  }
}
