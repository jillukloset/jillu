import { NextRequest, NextResponse } from 'next/server';
import { ok } from '@/lib/api-result';
import { handleRouteError } from '@/lib/handle-route-error';
import { requireSession } from '@/lib/current-user';
import { getNotificationsPage } from '@/modules/notifications/service';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const result = await getNotificationsPage(session.user.id, cursor);
    return NextResponse.json(ok(result));
  } catch (error) {
    return handleRouteError(error);
  }
}
