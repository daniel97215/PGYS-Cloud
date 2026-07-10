-- CreateTable
CREATE TABLE "Unit" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_workspaceId_code_key" ON "Unit"("workspaceId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_workspaceId_symbol_key" ON "Unit"("workspaceId", "symbol");

-- CreateIndex
CREATE INDEX "Unit_workspaceId_idx" ON "Unit"("workspaceId");

-- CreateIndex
CREATE INDEX "Unit_code_idx" ON "Unit"("code");

-- CreateIndex
CREATE INDEX "Unit_symbol_idx" ON "Unit"("symbol");

-- CreateIndex
CREATE INDEX "Unit_name_idx" ON "Unit"("name");

-- CreateIndex
CREATE INDEX "Unit_isActive_idx" ON "Unit"("isActive");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
