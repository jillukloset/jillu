import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { verifyEmail } from '@/modules/auth/service';

const schema = z.object({ token: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = schema.parse(body);
    await verifyEmail(token);
    return NextResponse.json(ok({ verified: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}
