import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { resetPasswordSchema } from '@/modules/auth/schemas';
import { resetPassword } from '@/modules/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);
    await resetPassword(input);
    return NextResponse.json(ok({ reset: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}
