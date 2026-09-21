import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireAdmin } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { resolveTaxonomyKind } from '@/modules/admin/taxonomy-kind';
import { renameTaxonomyEntry } from '@/modules/admin/taxonomy-service';

const schema = z.object({ name: z.string().trim().min(1, 'Enter a name').max(60) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  try {
    const session = await requireAdmin();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const { kind, id } = await params;
    const resolvedKind = resolveTaxonomyKind(kind);
    const body = await request.json();
    const { name } = schema.parse(body);
    const entry = await renameTaxonomyEntry(resolvedKind, session.user.id, id, name);
    return NextResponse.json(ok(entry));
  } catch (error) {
    return handleRouteError(error);
  }
}
