import { NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { markAllRead } from '@/modules/notifications/service';

export async function POST() {
  try {
    const session = await requireSession();
    await markAllRead(session.user.id);
    return NextResponse.json(ok({ read: true }));
  } catch (error) {
    return handleRouteError(error);
  }
}
