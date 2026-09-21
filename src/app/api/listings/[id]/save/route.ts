import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { saveListing, unsaveListing } from '@/modules/social/save-service';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`social:${session.user.id}`, RATE_LIMITS.socialAction.limit, RATE_LIMITS.socialAction.windowMs);
    const { id } = await params;
    await saveListing(session.user.id, id);
    return NextResponse.json(ok({ saved: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`social:${session.user.id}`, RATE_LIMITS.socialAction.limit, RATE_LIMITS.socialAction.windowMs);
    const { id } = await params;
    await unsaveListing(session.user.id, id);
    return NextResponse.json(ok({ saved: false }));
  } catch (error) {
    return handleRouteError(error);
  }
}
