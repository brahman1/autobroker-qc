CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "orderId" TEXT, "depositId" TEXT, "type" TEXT NOT NULL, "status" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'CAD', "reference" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PaymentEvent_userId_createdAt_idx" ON "PaymentEvent"("userId", "createdAt");
CREATE INDEX "PaymentEvent_orderId_createdAt_idx" ON "PaymentEvent"("orderId", "createdAt");
CREATE TABLE "CommunicationLog" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "channel" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'SIMULATED', "subject" TEXT NOT NULL, "body" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CommunicationLog_userId_createdAt_idx" ON "CommunicationLog"("userId", "createdAt");
CREATE TABLE "FraudFlag" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "auctionId" TEXT, "type" TEXT NOT NULL, "severity" TEXT NOT NULL, "details" JSONB, "status" TEXT NOT NULL DEFAULT 'OPEN', "reviewedBy" TEXT, "reviewedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FraudFlag_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FraudFlag_status_createdAt_idx" ON "FraudFlag"("status", "createdAt");
CREATE INDEX "FraudFlag_userId_createdAt_idx" ON "FraudFlag"("userId", "createdAt");
