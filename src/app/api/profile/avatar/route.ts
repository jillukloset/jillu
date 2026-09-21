import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { publicUrlForKey } from '@/lib/s3';
import { confirmAvatarUpload } from '@/modules/profile/service';

const schema = z.object({ objectKey: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { objectKey } = schema.parse(body);
    const profile = await confirmAvatarUpload(session.user.id, objectKey, publicUrlForKey(objectKey));
    return NextResponse.json(ok(profile));
  } catch (error) {
    return handleRouteError(error);
  }
}
