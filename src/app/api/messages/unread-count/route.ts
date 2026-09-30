import { NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { getTotalUnreadMessageCount } from '@/modules/messaging/service';

export async function GET() {
  try {
    const session = await requireSession();
    const count = await getTotalUnreadMessageCount(session.user.id);
    return NextResponse.json(ok({ count }));
  } catch (error) {
    return handleRouteError(error);
  }
}
