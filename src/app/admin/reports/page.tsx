import type { Metadata } from 'next';
import Link from 'next/link';
import { getReportsPage } from '@/modules/admin/reports-service';
import { formatRelativeTime } from '@/lib/format-time';

export const metadata: Metadata = { title: 'Admin · Reports — Jillu Kloset' };

const STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'];

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  DISMISSED: 'bg-slate-200 text-slate-600',
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; targetType?: string; cursor?: string }>;
}) {
  const params = await searchParams;
  const { items, hasMore } = await getReportsPage(
    { status: params.status, targetType: params.targetType },
    params.cursor,
  );

  const nextParams = new URLSearchParams();
  if (params.status) nextParams.set('status', params.status);
  if (params.targetType) nextParams.set('targetType', params.targetType);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Reports</h1>

      <form method="GET" className="mb-4 flex flex-wrap gap-2">
        <select name="status" defaultValue={params.status ?? ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="targetType" defaultValue={params.targetType ?? ''} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">Any target</option>
          <option value="LISTING">Listing</option>
          <option value="USER">User</option>
        </select>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="py-2">Reporter</th>
            <th className="py-2">Target</th>
            <th className="py-2">Reason</th>
            <th className="py-2">Reported</th>
            <th className="py-2">Status</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((report) => (
            <tr key={report.id} className="border-b border-slate-100">
              <td className="py-2 text-slate-600">
                {report.reporter.profile ? `@${report.reporter.profile.username}` : '—'}
              </td>
              <td className="py-2 text-slate-600">
                {report.targetType === 'LISTING'
                  ? report.listing?.title ?? 'Deleted listing'
                  : report.targetUser?.profile
                    ? `@${report.targetUser.profile.username}`
                    : 'Deleted user'}
              </td>
              <td className="py-2 text-slate-600">{report.reason.replaceAll('_', ' ')}</td>
              <td className="py-2 text-slate-600">{formatRelativeTime(report.createdAt)}</td>
              <td className="py-2">
                <span className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[report.status]}`}>
                  {report.status}
                </span>
              </td>
              <td className="py-2 text-right">
                <Link href={`/admin/reports/${report.id}`} className="text-xs font-semibold text-slate-700 underline">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {items.length === 0 ? <p className="py-6 text-sm text-slate-500">No reports match these filters.</p> : null}

      {hasMore && items.at(-1) ? (
        <div className="mt-4">
          <Link
            href={`/admin/reports?${(() => {
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
