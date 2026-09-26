-- CreateIndex
CREATE INDEX "Message_conversationId_senderId_readAt_idx" ON "Message"("conversationId", "senderId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_type_readAt_idx" ON "Notification"("userId", "type", "readAt");
