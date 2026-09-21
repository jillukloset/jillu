import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdminPage } from '@/lib/require-role';
import { listAuditLogs } from '@/modules/admin/audit';
import { formatRelativeTime } from '@/lib/format-time';

export const metadata: Metadata = { title: 'Admin · Audit log — Jillu Kloset' };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  await requireAdminPage('/admin/audit');
  const { cursor } = await searchParams;
  const rows = await listAuditLogs(cursor);
  const hasMore = rows.length > 30;
  const items = rows.slice(0, 30);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Audit log</h1>

      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="py-2">Actor</th>
            <th className="py-2">Action</th>
            <th className="py-2">Target</th>
            <th className="py-2">When</th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <tr key={log.id} className="border-b border-slate-100">
              <td className="py-2 text-slate-600">
                {log.actor.profile ? `@${log.actor.profile.username}` : log.actor.email}
              </td>
              <td className="py-2 font-medium text-slate-900">{log.action}</td>
              <td className="py-2 text-slate-600">
                {log.targetType} · {log.targetId}
              </td>
              <td className="py-2 text-slate-600">{formatRelativeTime(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {items.length === 0 ? <p className="py-6 text-sm text-slate-500">No audit entries yet.</p> : null}

      {hasMore && items.at(-1) ? (
        <div className="mt-4">
          <Link href={`/admin/audit?cursor=${items.at(-1)!.id}`} className="text-sm font-semibold text-slate-700 underline">
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
