-- CreateTable
CREATE TABLE "WorkspaceService" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "configuration" JSONB,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceService_workspaceId_serviceKey_key" ON "WorkspaceService"("workspaceId", "serviceKey");

-- CreateIndex
CREATE INDEX "WorkspaceService_workspaceId_idx" ON "WorkspaceService"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceService_serviceKey_idx" ON "WorkspaceService"("serviceKey");

-- AddForeignKey
ALTER TABLE "WorkspaceService" ADD CONSTRAINT "WorkspaceService_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
