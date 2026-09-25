import {
  countAdminRemovedListings,
  countAuditLogEntries,
  countReportsByReason,
  countReportsByStatus,
  countSuspendedUsers,
} from './moderation-summary-repository';

export async function getModerationSummary() {
  const [byStatus, byReason, suspendedUsers, removedListings, auditLogEntries] = await Promise.all([
    countReportsByStatus(),
    countReportsByReason(),
    countSuspendedUsers(),
    countAdminRemovedListings(),
    countAuditLogEntries(),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));
  const reasonCounts = Object.fromEntries(byReason.map((r) => [r.reason, r._count._all]));
  const openReports = (statusCounts.OPEN ?? 0) + (statusCounts.REVIEWING ?? 0);

  return {
    openReports,
    resolvedReports: statusCounts.RESOLVED ?? 0,
    dismissedReports: statusCounts.DISMISSED ?? 0,
    counterfeitReports: reasonCounts.COUNTERFEIT ?? 0,
    scamReports: reasonCounts.SCAM ?? 0,
    suspendedUsers,
    removedListings,
    auditLogEntries,
  };
}
