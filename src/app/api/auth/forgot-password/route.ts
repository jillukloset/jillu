import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { enforceRateLimit, RATE_LIMITS, requestIp } from '@/lib/rate-limit';
import { forgotPasswordSchema } from '@/modules/auth/schemas';
import { requestPasswordReset } from '@/modules/auth/service';

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(
      `forgot-password-ip:${requestIp(request)}`,
      RATE_LIMITS.passwordReset.limit,
      RATE_LIMITS.passwordReset.windowMs,
    );
    const body = await request.json();
    const input = forgotPasswordSchema.parse(body);
    enforceRateLimit(
      `forgot-password-email:${input.email}`,
      RATE_LIMITS.passwordReset.limit,
      RATE_LIMITS.passwordReset.windowMs,
    );
    await requestPasswordReset(input);
    // Always respond success — never reveal whether the email is registered.
    return NextResponse.json(ok({ sent: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}
