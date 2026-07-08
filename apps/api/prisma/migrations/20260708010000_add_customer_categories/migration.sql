-- CreateTable
CREATE TABLE "CustomerCategory" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCategory_workspaceId_code_key" ON "CustomerCategory"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "CustomerCategory_workspaceId_idx" ON "CustomerCategory"("workspaceId");

-- CreateIndex
CREATE INDEX "CustomerCategory_name_idx" ON "CustomerCategory"("name");

-- CreateIndex
CREATE INDEX "CustomerCategory_isActive_idx" ON "CustomerCategory"("isActive");

-- AddForeignKey
ALTER TABLE "CustomerCategory" ADD CONSTRAINT "CustomerCategory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
