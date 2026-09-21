import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { followUser, unfollowUser } from '@/modules/social/follow-service';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`social:${session.user.id}`, RATE_LIMITS.socialAction.limit, RATE_LIMITS.socialAction.windowMs);
    const { id } = await params;
    await followUser(session.user.id, id);
    return NextResponse.json(ok({ following: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`social:${session.user.id}`, RATE_LIMITS.socialAction.limit, RATE_LIMITS.socialAction.windowMs);
    const { id } = await params;
    await unfollowUser(session.user.id, id);
    return NextResponse.json(ok({ following: false }));
  } catch (error) {
    return handleRouteError(error);
  }
}
