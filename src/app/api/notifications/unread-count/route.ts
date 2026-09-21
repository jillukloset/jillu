import { NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { getUnreadCount } from '@/modules/notifications/service';

export async function GET() {
  try {
    const session = await requireSession();
    const count = await getUnreadCount(session.user.id);
    return NextResponse.json(ok({ count }));
  } catch (error) {
    return handleRouteError(error);
  }
}
