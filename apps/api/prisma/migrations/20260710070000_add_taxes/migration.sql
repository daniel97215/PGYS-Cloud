-- CreateTable
CREATE TABLE "Tax" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tax_workspaceId_code_key" ON "Tax"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "Tax_workspaceId_idx" ON "Tax"("workspaceId");

-- CreateIndex
CREATE INDEX "Tax_code_idx" ON "Tax"("code");

-- CreateIndex
CREATE INDEX "Tax_rate_idx" ON "Tax"("rate");

-- CreateIndex
CREATE INDEX "Tax_isDefault_idx" ON "Tax"("isDefault");

-- CreateIndex
CREATE INDEX "Tax_isActive_idx" ON "Tax"("isActive");

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
