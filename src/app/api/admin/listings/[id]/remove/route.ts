import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireModerator } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { adminRemoveListing } from '@/modules/admin/listings-service';

const schema = z.object({ reason: z.string().trim().max(500).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireModerator();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = schema.parse(body);
    const listing = await adminRemoveListing(session.user.id, id, reason);
    return NextResponse.json(ok({ id: listing.id, status: listing.status }));
  } catch (error) {
    return handleRouteError(error);
  }
}
