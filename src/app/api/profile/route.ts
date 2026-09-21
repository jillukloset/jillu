import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { updateProfileSchema } from '@/modules/profile/schemas';
import { updateOwnProfile } from '@/modules/profile/service';

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const profile = await updateOwnProfile(session.user.id, input);
    return NextResponse.json(ok(profile));
  } catch (error) {
    return handleRouteError(error);
  }
}
