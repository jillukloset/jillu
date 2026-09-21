import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin');

  const role = session.user.role;
  if (role !== 'MODERATOR' && role !== 'ADMIN') {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-6 lg:px-8 lg:py-6">
        <aside className="lg:w-52 lg:shrink-0">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:mb-3">
            Jillu Admin · {role === 'ADMIN' ? 'Admin' : 'Moderator'}
          </p>
          <AdminNav isAdmin={role === 'ADMIN'} />
        </aside>
        <main className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">{children}</main>
      </div>
    </div>
  );
}
