import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { presignRequestSchema } from '@/modules/media/schemas';
import { createPresignedUpload } from '@/modules/media/service';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = presignRequestSchema.parse(body);
    const result = await createPresignedUpload(session.user.id, input);
    return NextResponse.json(ok(result));
  } catch (error) {
    return handleRouteError(error);
  }
}
