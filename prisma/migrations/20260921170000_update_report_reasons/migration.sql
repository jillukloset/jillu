-- Report table is empty at this point (Phase 6 is the first consumer of it),
-- so this enum value swap is safe with no data migration required.
CREATE TYPE "ReportReason_new" AS ENUM ('SPAM', 'COUNTERFEIT', 'PROHIBITED_ITEM', 'MISLEADING', 'SCAM', 'INAPPROPRIATE_CONTENT', 'OTHER');
ALTER TABLE "Report" ALTER COLUMN "reason" TYPE "ReportReason_new" USING ("reason"::text::"ReportReason_new");
ALTER TYPE "ReportReason" RENAME TO "ReportReason_old";
ALTER TYPE "ReportReason_new" RENAME TO "ReportReason";
DROP TYPE "ReportReason_old";
