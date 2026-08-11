CREATE TYPE "CrmOpportunityStatus" AS ENUM ('OPEN', 'WON', 'LOST');
CREATE TYPE "CrmActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE');
CREATE TYPE "CrmActivityStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "CrmOpportunity" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessPartnerId" UUID NOT NULL,
    "contactId" UUID,
    "pipelineId" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "amount" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "dueAt" TIMESTAMP(3),
    "responsibleMemberId" UUID,
    "status" "CrmOpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmActivity" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "businessPartnerId" UUID NOT NULL,
    "opportunityId" UUID,
    "contactId" UUID,
    "responsibleMemberId" UUID,
    "type" "CrmActivityType" NOT NULL,
    "status" "CrmActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CrmOpportunity_workspaceId_code_key" ON "CrmOpportunity"("workspaceId", "code");
CREATE INDEX "CrmOpportunity_workspaceId_idx" ON "CrmOpportunity"("workspaceId");
CREATE INDEX "CrmOpportunity_businessPartnerId_idx" ON "CrmOpportunity"("businessPartnerId");
CREATE INDEX "CrmOpportunity_contactId_idx" ON "CrmOpportunity"("contactId");
CREATE INDEX "CrmOpportunity_pipelineId_idx" ON "CrmOpportunity"("pipelineId");
CREATE INDEX "CrmOpportunity_stageId_idx" ON "CrmOpportunity"("stageId");
CREATE INDEX "CrmOpportunity_responsibleMemberId_idx" ON "CrmOpportunity"("responsibleMemberId");
CREATE INDEX "CrmOpportunity_status_idx" ON "CrmOpportunity"("status");
CREATE INDEX "CrmOpportunity_dueAt_idx" ON "CrmOpportunity"("dueAt");

CREATE INDEX "CrmActivity_workspaceId_idx" ON "CrmActivity"("workspaceId");
CREATE INDEX "CrmActivity_businessPartnerId_idx" ON "CrmActivity"("businessPartnerId");
CREATE INDEX "CrmActivity_opportunityId_idx" ON "CrmActivity"("opportunityId");
CREATE INDEX "CrmActivity_contactId_idx" ON "CrmActivity"("contactId");
CREATE INDEX "CrmActivity_responsibleMemberId_idx" ON "CrmActivity"("responsibleMemberId");
CREATE INDEX "CrmActivity_type_idx" ON "CrmActivity"("type");
CREATE INDEX "CrmActivity_status_idx" ON "CrmActivity"("status");
CREATE INDEX "CrmActivity_scheduledAt_idx" ON "CrmActivity"("scheduledAt");

ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "BusinessPartnerContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "CrmPipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "CrmPipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_responsibleMemberId_fkey" FOREIGN KEY ("responsibleMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "BusinessPartnerContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_responsibleMemberId_fkey" FOREIGN KEY ("responsibleMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
