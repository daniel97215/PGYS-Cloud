-- CreateTable
CREATE TABLE "BusinessPartnerRoleAssignment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "businessPartnerRoleId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "BusinessPartnerRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerRoleAssignment_customerId_businessPartnerRoleId_key" ON "BusinessPartnerRoleAssignment"("customerId", "businessPartnerRoleId");

-- CreateIndex
CREATE INDEX "BusinessPartnerRoleAssignment_workspaceId_idx" ON "BusinessPartnerRoleAssignment"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerRoleAssignment_customerId_idx" ON "BusinessPartnerRoleAssignment"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerRoleAssignment_businessPartnerRoleId_idx" ON "BusinessPartnerRoleAssignment"("businessPartnerRoleId");

-- AddForeignKey
ALTER TABLE "BusinessPartnerRoleAssignment" ADD CONSTRAINT "BusinessPartnerRoleAssignment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerRoleAssignment" ADD CONSTRAINT "BusinessPartnerRoleAssignment_businessPartnerRoleId_fkey" FOREIGN KEY ("businessPartnerRoleId") REFERENCES "BusinessPartnerRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
