import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireAdmin } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { updateVibe } from '@/modules/admin/taxonomy-service';

const schema = z.object({
  description: z.string().max(200).nullable().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #FF5733')
    .nullable()
    .optional(),
  bannerObjectKey: z.string().min(1).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const { id } = await params;
    const body = await request.json();
    const data = schema.parse(body);
    const entry = await updateVibe(session.user.id, id, data);
    return NextResponse.json(ok(entry));
  } catch (error) {
    return handleRouteError(error);
  }
}
