import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireAdmin } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { resolveTaxonomyKind } from '@/modules/admin/taxonomy-kind';
import { setTaxonomyActive } from '@/modules/admin/taxonomy-service';

const schema = z.object({ isActive: z.boolean() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  try {
    const session = await requireAdmin();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const { kind, id } = await params;
    const resolvedKind = resolveTaxonomyKind(kind);
    const body = await request.json();
    const { isActive } = schema.parse(body);
    const entry = await setTaxonomyActive(resolvedKind, session.user.id, id, isActive);
    return NextResponse.json(ok(entry));
  } catch (error) {
    return handleRouteError(error);
  }
}
