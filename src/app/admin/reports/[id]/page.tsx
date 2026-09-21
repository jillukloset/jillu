import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { AppError } from '@/lib/api-result';
import { getReportForAdmin } from '@/modules/admin/reports-service';
import { ReportActions } from '@/components/admin/report-actions';
import { formatRelativeTime } from '@/lib/format-time';

export const metadata: Metadata = { title: 'Admin · Report — Jillu Kloset' };

export default async function AdminReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  let report;
  try {
    report = await getReportForAdmin(id);
  } catch (error) {
    if (error instanceof AppError) notFound();
    throw error;
  }

  const responsibleUser = report.targetType === 'LISTING' ? report.listing?.seller : report.targetUser;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/reports" className="text-xs font-semibold text-slate-500 hover:underline">
          ← Back to reports
        </Link>
        <h1 className="mt-1 text-xl font-semibold">Report {report.id}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 p-4 text-sm">
        <div>
          <p className="text-xs uppercase text-slate-500">Reporter</p>
          <p className="font-medium">{report.reporter.profile ? `@${report.reporter.profile.username}` : '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Reported</p>
          <p className="font-medium">{formatRelativeTime(report.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Reason</p>
          <p className="font-medium">{report.reason.replaceAll('_', ' ')}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Status</p>
          <p className="font-medium">{report.status}</p>
        </div>
        {report.details ? (
          <div className="col-span-2">
            <p className="text-xs uppercase text-slate-500">Details</p>
            <p>{report.details}</p>
          </div>
        ) : null}
        {report.adminNote ? (
          <div className="col-span-2">
            <p className="text-xs uppercase text-slate-500">Admin note</p>
            <p>{report.adminNote}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-md border border-slate-200 p-4 text-sm">
        <p className="mb-2 text-xs uppercase text-slate-500">Target</p>
        {report.targetType === 'LISTING' ? (
          report.listing ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{report.listing.title}</p>
                <p className="text-slate-500">Status: {report.listing.status}</p>
                {report.listing.seller.profile ? (
                  <p className="text-slate-500">
                    Seller: @{report.listing.seller.profile.username}
                  </p>
                ) : null}
              </div>
              <Link href={`/listing/${report.listing.id}`} className="text-xs font-semibold text-slate-700 underline">
                View listing
              </Link>
            </div>
          ) : (
            <p className="text-slate-400">This listing was deleted.</p>
          )
        ) : report.targetUser?.profile ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">@{report.targetUser.profile.username}</p>
              <p className="text-slate-500">Status: {report.targetUser.status}</p>
            </div>
            <Link href={`/closet/${report.targetUser.profile.username}`} className="text-xs font-semibold text-slate-700 underline">
              View closet
            </Link>
          </div>
        ) : (
          <p className="text-slate-400">This user no longer exists.</p>
        )}
      </div>

      <ReportActions
        reportId={report.id}
        status={report.status}
        listingId={report.targetType === 'LISTING' ? report.listing?.id ?? null : null}
        listingStatus={report.targetType === 'LISTING' ? report.listing?.status ?? null : null}
        responsibleUserId={responsibleUser?.id ?? null}
        responsibleUserStatus={responsibleUser?.status ?? null}
        responsibleUserRole={responsibleUser?.role ?? null}
        viewerId={session!.user.id}
      />
    </div>
  );
}
