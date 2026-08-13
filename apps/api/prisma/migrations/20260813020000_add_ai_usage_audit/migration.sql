-- CreateEnum
CREATE TYPE "AiUsageStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "AiUsageAudit" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "actorId" UUID,
    "sourceModule" VARCHAR(80) NOT NULL,
    "useCase" VARCHAR(120) NOT NULL,
    "provider" VARCHAR(40) NOT NULL,
    "model" VARCHAR(120) NOT NULL,
    "status" "AiUsageStatus" NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "errorCode" VARCHAR(80),
    "errorMessage" VARCHAR(160),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsageAudit_workspaceId_createdAt_idx" ON "AiUsageAudit"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageAudit_workspaceId_status_createdAt_idx" ON "AiUsageAudit"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageAudit_workspaceId_provider_createdAt_idx" ON "AiUsageAudit"("workspaceId", "provider", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageAudit_workspaceId_useCase_createdAt_idx" ON "AiUsageAudit"("workspaceId", "useCase", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageAudit_actorId_idx" ON "AiUsageAudit"("actorId");

-- AddForeignKey
ALTER TABLE "AiUsageAudit" ADD CONSTRAINT "AiUsageAudit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageAudit" ADD CONSTRAINT "AiUsageAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
