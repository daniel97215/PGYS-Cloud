CREATE TYPE "CrmPipelineStageType" AS ENUM ('OPEN', 'WON', 'LOST');

CREATE TABLE "CrmPipeline" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmPipeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmPipelineStage" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "type" "CrmPipelineStageType" NOT NULL DEFAULT 'OPEN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmPipelineStage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CrmPipeline_workspaceId_code_key" ON "CrmPipeline"("workspaceId", "code");
CREATE INDEX "CrmPipeline_workspaceId_idx" ON "CrmPipeline"("workspaceId");
CREATE INDEX "CrmPipeline_name_idx" ON "CrmPipeline"("name");
CREATE INDEX "CrmPipeline_isActive_idx" ON "CrmPipeline"("isActive");

CREATE UNIQUE INDEX "CrmPipelineStage_pipelineId_code_key" ON "CrmPipelineStage"("pipelineId", "code");
CREATE UNIQUE INDEX "CrmPipelineStage_pipelineId_position_key" ON "CrmPipelineStage"("pipelineId", "position");
CREATE INDEX "CrmPipelineStage_workspaceId_idx" ON "CrmPipelineStage"("workspaceId");
CREATE INDEX "CrmPipelineStage_pipelineId_idx" ON "CrmPipelineStage"("pipelineId");
CREATE INDEX "CrmPipelineStage_type_idx" ON "CrmPipelineStage"("type");
CREATE INDEX "CrmPipelineStage_isActive_idx" ON "CrmPipelineStage"("isActive");

ALTER TABLE "CrmPipeline"
ADD CONSTRAINT "CrmPipeline_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmPipelineStage"
ADD CONSTRAINT "CrmPipelineStage_pipelineId_fkey"
FOREIGN KEY ("pipelineId") REFERENCES "CrmPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
