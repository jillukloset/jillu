import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireAdmin } from '@/lib/require-role';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { assertValidCtaHref, updateHeroConfig } from '@/modules/admin/hero-service';

const hexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const href = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((v) => v.startsWith('/') || /^https:\/\//.test(v), {
    message: 'Links must start with "/" or "https://".',
  });

const schema = z.object({
  isActive: z.boolean().optional(),
  eyebrow: z.string().trim().min(1).max(80).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  subtitle: z.string().trim().min(1).max(160).optional(),
  backgroundColor: z.string().regex(hexColor, 'Use a #RGB or #RRGGBB color.').optional(),
  overlayOpacity: z.number().int().min(0).max(90).optional(),
  textAlign: z.enum(['left', 'center']).optional(),
  primaryCtaLabel: z.string().trim().min(1).max(30).optional(),
  primaryCtaHref: href.optional(),
  secondaryCtaLabel: z.string().trim().min(1).max(30).optional(),
  secondaryCtaHref: href.optional(),
  backgroundObjectKey: z.string().min(1).max(500).nullable().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    enforceRateLimit(`admin:${session.user.id}`, RATE_LIMITS.adminMutation.limit, RATE_LIMITS.adminMutation.windowMs);
    const body = await request.json();
    const input = schema.parse(body);

    if (input.primaryCtaHref) assertValidCtaHref(input.primaryCtaHref);
    if (input.secondaryCtaHref) assertValidCtaHref(input.secondaryCtaHref);

    const updated = await updateHeroConfig(session.user.id, input);
    return NextResponse.json(ok(updated));
  } catch (error) {
    return handleRouteError(error);
  }
}
