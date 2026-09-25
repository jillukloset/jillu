-- Admin business dashboard: plain createdAt indexes to support time-series bucketing
-- queries (new users/listings/conversations per day) that aren't scoped by status,
-- so the existing composite indexes (e.g. Listing(status, createdAt)) don't apply.

CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");
