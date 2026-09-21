import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { getUsersPage } from '@/modules/admin/users-service';
import { UserRowActions } from '@/components/admin/user-row-actions';

export const metadata: Metadata = { title: 'Admin · Users — Jillu Kloset' };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; role?: string; cursor?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { items, hasMore } = await getUsersPage(
    { search: params.search, status: params.status, role: params.role },
    params.cursor,
  );

  const nextParams = new URLSearchParams();
  if (params.search) nextParams.set('search', params.search);
  if (params.status) nextParams.set('status', params.status);
  if (params.role) nextParams.set('role', params.role);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Users</h1>

      <form method="GET" className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="search"
          defaultValue={params.search}
          placeholder="Search email, username, name…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <select name="status" defaultValue={params.status ?? ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select name="role" defaultValue={params.role ?? ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any role</option>
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="py-2">User</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2">Joined</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr key={user.id} className="border-b border-slate-100">
              <td className="py-2">
                {user.profile ? (
                  <Link href={`/closet/${user.profile.username}`} className="font-medium text-slate-900 hover:underline">
                    @{user.profile.username}
                  </Link>
                ) : (
                  <span className="text-slate-400">No profile</span>
                )}
              </td>
              <td className="py-2 text-slate-600">{user.email}</td>
              <td className="py-2 text-slate-600">{user.role}</td>
              <td className="py-2">
                <span
                  className={
                    user.status === 'SUSPENDED'
                      ? 'rounded-pill bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700'
                      : 'rounded-pill bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'
                  }
                >
                  {user.status}
                </span>
              </td>
              <td className="py-2 text-slate-600">{user.createdAt.toISOString().slice(0, 10)}</td>
              <td className="py-2 text-right">
                <UserRowActions
                  userId={user.id}
                  status={user.status}
                  disabled={user.id === session?.user.id || user.role === 'ADMIN'}
                  disabledReason={user.id === session?.user.id ? 'You' : user.role === 'ADMIN' ? 'Admin' : undefined}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {items.length === 0 ? <p className="py-6 text-sm text-slate-500">No users match these filters.</p> : null}

      {hasMore && items.at(-1) ? (
        <div className="mt-4">
          <Link
            href={`/admin/users?${(() => {
              const p = new URLSearchParams(nextParams);
              p.set('cursor', items.at(-1)!.id);
              return p.toString();
            })()}`}
            className="text-sm font-semibold text-slate-700 underline"
          >
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
