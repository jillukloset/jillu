import { auth } from '@/auth';
import { DesktopNav } from './desktop-nav';
import { MobileTopBar } from './mobile-top-bar';
import { MobileTabBar } from './mobile-tab-bar';

export async function SiteHeader() {
  const session = await auth();

  return (
    <>
      <DesktopNav session={session} />
      <MobileTopBar session={session} />
      <MobileTabBar session={session} />
    </>
  );
}
