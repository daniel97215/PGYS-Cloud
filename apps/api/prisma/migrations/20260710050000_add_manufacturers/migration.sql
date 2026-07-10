-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_workspaceId_code_key" ON "Manufacturer"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "Manufacturer_workspaceId_idx" ON "Manufacturer"("workspaceId");

-- CreateIndex
CREATE INDEX "Manufacturer_code_idx" ON "Manufacturer"("code");

-- CreateIndex
CREATE INDEX "Manufacturer_name_idx" ON "Manufacturer"("name");

-- CreateIndex
CREATE INDEX "Manufacturer_isActive_idx" ON "Manufacturer"("isActive");

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
