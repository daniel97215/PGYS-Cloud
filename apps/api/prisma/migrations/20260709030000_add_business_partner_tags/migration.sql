-- CreateTable
CREATE TABLE "BusinessPartnerTag" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartnerTagAssignment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "businessPartnerTagId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPartnerTagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerTag_workspaceId_code_key" ON "BusinessPartnerTag"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "BusinessPartnerTag_workspaceId_idx" ON "BusinessPartnerTag"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerTag_code_idx" ON "BusinessPartnerTag"("code");

-- CreateIndex
CREATE INDEX "BusinessPartnerTag_isActive_idx" ON "BusinessPartnerTag"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerTagAssignment_customerId_businessPartnerTagId_key" ON "BusinessPartnerTagAssignment"("customerId", "businessPartnerTagId");

-- CreateIndex
CREATE INDEX "BusinessPartnerTagAssignment_workspaceId_idx" ON "BusinessPartnerTagAssignment"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerTagAssignment_customerId_idx" ON "BusinessPartnerTagAssignment"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerTagAssignment_businessPartnerTagId_idx" ON "BusinessPartnerTagAssignment"("businessPartnerTagId");

-- AddForeignKey
ALTER TABLE "BusinessPartnerTag" ADD CONSTRAINT "BusinessPartnerTag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerTagAssignment" ADD CONSTRAINT "BusinessPartnerTagAssignment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerTagAssignment" ADD CONSTRAINT "BusinessPartnerTagAssignment_businessPartnerTagId_fkey" FOREIGN KEY ("businessPartnerTagId") REFERENCES "BusinessPartnerTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
