-- CreateIndex
CREATE INDEX "Notification_userId_type_readAt_conversationId_idx"
ON "Notification"("userId", "type", "readAt", ((payload ->> 'conversationId')));
