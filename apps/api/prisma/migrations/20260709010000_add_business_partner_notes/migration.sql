-- CreateTable
CREATE TABLE "BusinessPartnerNote" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerNote_workspaceId_idx" ON "BusinessPartnerNote"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerNote_customerId_idx" ON "BusinessPartnerNote"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerNote_createdAt_idx" ON "BusinessPartnerNote"("createdAt");

-- AddForeignKey
ALTER TABLE "BusinessPartnerNote" ADD CONSTRAINT "BusinessPartnerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
