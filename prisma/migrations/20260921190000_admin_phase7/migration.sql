-- ReportStatus: rename REVIEWED/ACTIONED to REVIEWING/RESOLVED to match Phase 7 naming.
-- All existing Report rows are currently 'OPEN', which exists in both the old and new enum,
-- so this cast is safe with no data loss.
CREATE TYPE "ReportStatus_new" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');
ALTER TABLE "Report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "status" TYPE "ReportStatus_new" USING (
  CASE "status"::text
    WHEN 'REVIEWED' THEN 'REVIEWING'
    WHEN 'ACTIONED' THEN 'RESOLVED'
    ELSE "status"::text
  END::"ReportStatus_new"
);
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'OPEN';
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "ReportStatus_old";

-- Taxonomy soft-disable support.
ALTER TABLE "Category" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Brand" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Vibe" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
