-- CreateTable
CREATE TABLE "ProvisioningJob" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvisioningJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProvisioningJob_workspaceId_idx" ON "ProvisioningJob"("workspaceId");

-- CreateIndex
CREATE INDEX "ProvisioningJob_subscriptionId_idx" ON "ProvisioningJob"("subscriptionId");

-- CreateIndex
CREATE INDEX "ProvisioningJob_status_idx" ON "ProvisioningJob"("status");
