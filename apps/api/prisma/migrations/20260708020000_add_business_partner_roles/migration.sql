-- CreateTable
CREATE TABLE "BusinessPartnerRole" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerRole_workspaceId_code_key" ON "BusinessPartnerRole"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_workspaceId_idx" ON "BusinessPartnerRole"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_code_idx" ON "BusinessPartnerRole"("code");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_isActive_idx" ON "BusinessPartnerRole"("isActive");

-- AddForeignKey
ALTER TABLE "BusinessPartnerRole" ADD CONSTRAINT "BusinessPartnerRole_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
