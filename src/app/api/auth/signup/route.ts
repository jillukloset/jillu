import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { enforceRateLimit, RATE_LIMITS, requestIp } from '@/lib/rate-limit';
import { signupSchema } from '@/modules/auth/schemas';
import { signup } from '@/modules/auth/service';

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`signup:${requestIp(request)}`, RATE_LIMITS.signup.limit, RATE_LIMITS.signup.windowMs);
    const body = await request.json();
    const input = signupSchema.parse(body);
    const user = await signup(input);
    return NextResponse.json(ok({ id: user.id, email: user.email }), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
