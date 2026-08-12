CREATE TYPE "MarketingChannel" AS ENUM ('EMAIL', 'SMS');
CREATE TYPE "MarketingCampaignStatus" AS ENUM ('DRAFT', 'READY', 'CANCELLED');

CREATE TABLE "MarketingTemplate" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCampaign" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "channel" "MarketingChannel" NOT NULL,
    "status" "MarketingCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "segmentId" UUID NOT NULL,
    "templateId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingTemplate_workspaceId_code_key" ON "MarketingTemplate"("workspaceId", "code");
CREATE INDEX "MarketingTemplate_workspaceId_idx" ON "MarketingTemplate"("workspaceId");
CREATE INDEX "MarketingTemplate_channel_idx" ON "MarketingTemplate"("channel");
CREATE INDEX "MarketingTemplate_isActive_idx" ON "MarketingTemplate"("isActive");
CREATE UNIQUE INDEX "MarketingCampaign_workspaceId_code_key" ON "MarketingCampaign"("workspaceId", "code");
CREATE INDEX "MarketingCampaign_workspaceId_idx" ON "MarketingCampaign"("workspaceId");
CREATE INDEX "MarketingCampaign_segmentId_idx" ON "MarketingCampaign"("segmentId");
CREATE INDEX "MarketingCampaign_templateId_idx" ON "MarketingCampaign"("templateId");
CREATE INDEX "MarketingCampaign_channel_idx" ON "MarketingCampaign"("channel");
CREATE INDEX "MarketingCampaign_status_idx" ON "MarketingCampaign"("status");

ALTER TABLE "MarketingTemplate" ADD CONSTRAINT "MarketingTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "MarketingSegment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MarketingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
