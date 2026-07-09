-- CreateTable
CREATE TABLE "BusinessPartnerDocument" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerDocument_workspaceId_idx" ON "BusinessPartnerDocument"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerDocument_customerId_idx" ON "BusinessPartnerDocument"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerDocument_documentType_idx" ON "BusinessPartnerDocument"("documentType");

-- CreateIndex
CREATE INDEX "BusinessPartnerDocument_createdAt_idx" ON "BusinessPartnerDocument"("createdAt");

-- AddForeignKey
ALTER TABLE "BusinessPartnerDocument" ADD CONSTRAINT "BusinessPartnerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
