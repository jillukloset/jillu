import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireModerator } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { reviewReport } from '@/modules/admin/reports-service';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireModerator();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const { id } = await params;
    const report = await reviewReport(session.user.id, id);
    return NextResponse.json(ok({ id: report.id, status: report.status }));
  } catch (error) {
    return handleRouteError(error);
  }
}
