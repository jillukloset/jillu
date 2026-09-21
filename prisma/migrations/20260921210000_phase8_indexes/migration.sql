-- Phase 8 hardening: add indexes to match actual query patterns found during audit.

-- Listing: browse/search by status ordered by price (in addition to existing status+createdAt).
CREATE INDEX "Listing_status_price_idx" ON "Listing"("status", "price");

-- Conversation: listConversationsForUser filters by buyerId/sellerId and always orders by
-- updatedAt DESC. Replace the old single-column indexes with composite ones that support
-- both the filter and the sort.
DROP INDEX IF EXISTS "Conversation_buyerId_idx";
DROP INDEX IF EXISTS "Conversation_sellerId_idx";
CREATE INDEX "Conversation_buyerId_updatedAt_idx" ON "Conversation"("buyerId", "updatedAt");
CREATE INDEX "Conversation_sellerId_updatedAt_idx" ON "Conversation"("sellerId", "updatedAt");

-- Report: admin reports list filters by status and always orders by createdAt DESC.
DROP INDEX IF EXISTS "Report_status_idx";
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- AuditLog: admin audit log page lists all entries ordered by createdAt DESC with no
-- target filter — previously had zero index support for that query.
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
