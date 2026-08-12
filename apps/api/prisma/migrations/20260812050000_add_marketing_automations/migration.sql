CREATE TYPE "MarketingAutomationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');
CREATE TYPE "MarketingAutomationTrigger" AS ENUM ('BUSINESS_PARTNER_CREATED', 'TAG_ASSIGNED', 'CATEGORY_ASSIGNED', 'ROLE_ASSIGNED');
CREATE TYPE "MarketingAutomationAction" AS ENUM ('ENROLL_IN_CAMPAIGN');

CREATE TABLE "MarketingAutomation" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "MarketingAutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "trigger" "MarketingAutomationTrigger" NOT NULL,
    "action" "MarketingAutomationAction" NOT NULL DEFAULT 'ENROLL_IN_CAMPAIGN',
    "campaignId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingAutomation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingAutomation_workspaceId_code_key" ON "MarketingAutomation"("workspaceId", "code");
CREATE INDEX "MarketingAutomation_workspaceId_idx" ON "MarketingAutomation"("workspaceId");
CREATE INDEX "MarketingAutomation_campaignId_idx" ON "MarketingAutomation"("campaignId");
CREATE INDEX "MarketingAutomation_status_idx" ON "MarketingAutomation"("status");
CREATE INDEX "MarketingAutomation_trigger_idx" ON "MarketingAutomation"("trigger");

ALTER TABLE "MarketingAutomation" ADD CONSTRAINT "MarketingAutomation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingAutomation" ADD CONSTRAINT "MarketingAutomation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
