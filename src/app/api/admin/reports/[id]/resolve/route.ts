import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireModerator } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { resolveReport } from '@/modules/admin/reports-service';

const schema = z.object({ adminNote: z.string().trim().max(1000).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireModerator();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { adminNote } = schema.parse(body);
    const report = await resolveReport(session.user.id, id, adminNote);
    return NextResponse.json(ok({ id: report.id, status: report.status }));
  } catch (error) {
    return handleRouteError(error);
  }
}
