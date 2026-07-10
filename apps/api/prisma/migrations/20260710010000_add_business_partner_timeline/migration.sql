-- CreateTable
CREATE TABLE "BusinessPartnerTimelineEntry" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceModule" TEXT NOT NULL,
    "sourceId" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPartnerTimelineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerTimelineEntry_workspaceId_idx" ON "BusinessPartnerTimelineEntry"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerTimelineEntry_customerId_idx" ON "BusinessPartnerTimelineEntry"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerTimelineEntry_eventType_idx" ON "BusinessPartnerTimelineEntry"("eventType");

-- CreateIndex
CREATE INDEX "BusinessPartnerTimelineEntry_sourceModule_idx" ON "BusinessPartnerTimelineEntry"("sourceModule");

-- CreateIndex
CREATE INDEX "BusinessPartnerTimelineEntry_occurredAt_idx" ON "BusinessPartnerTimelineEntry"("occurredAt");

-- AddForeignKey
ALTER TABLE "BusinessPartnerTimelineEntry" ADD CONSTRAINT "BusinessPartnerTimelineEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
