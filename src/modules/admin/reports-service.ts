import { AppError } from '@/lib/api-result';
import { recordAuditLog } from './audit';
import {
  ADMIN_REPORTS_PAGE_SIZE,
  findReportById,
  listReportsForAdmin,
  updateReportStatus,
} from './reports-repository';

export async function getReportsPage(filters: { status?: string; targetType?: string }, cursor?: string) {
  const rows = await listReportsForAdmin(filters, cursor);
  const hasMore = rows.length > ADMIN_REPORTS_PAGE_SIZE;
  return { items: rows.slice(0, ADMIN_REPORTS_PAGE_SIZE), hasMore };
}

async function requireReport(reportId: string) {
  const report = await findReportById(reportId);
  if (!report) throw new AppError('REPORT_NOT_FOUND', 'Report not found.', 404);
  return report;
}

export async function getReportForAdmin(reportId: string) {
  return requireReport(reportId);
}

export async function reviewReport(actorId: string, reportId: string) {
  await requireReport(reportId);
  return updateReportStatus(reportId, 'REVIEWING');
}

export async function resolveReport(actorId: string, reportId: string, adminNote?: string) {
  const report = await requireReport(reportId);
  const updated = await updateReportStatus(reportId, 'RESOLVED', adminNote);
  await recordAuditLog(actorId, 'REPORT_RESOLVED', 'REPORT', reportId, {
    targetType: report.targetType,
    reason: report.reason,
  });
  return updated;
}

export async function dismissReport(actorId: string, reportId: string, adminNote?: string) {
  const report = await requireReport(reportId);
  const updated = await updateReportStatus(reportId, 'DISMISSED', adminNote);
  await recordAuditLog(actorId, 'REPORT_DISMISSED', 'REPORT', reportId, {
    targetType: report.targetType,
    reason: report.reason,
  });
  return updated;
}
