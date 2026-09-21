import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createReportSchema } from '@/modules/reports/schemas';
import { reportUser } from '@/modules/reports/service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    enforceRateLimit(`report:${session.user.id}`, RATE_LIMITS.reports.limit, RATE_LIMITS.reports.windowMs);
    const { id } = await params;
    const body = await request.json();
    const input = createReportSchema.parse(body);
    const report = await reportUser(session.user.id, id, input);
    return NextResponse.json(ok({ id: report.id }), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
