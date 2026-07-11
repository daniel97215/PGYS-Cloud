-- CreateTable
CREATE TABLE "PriceList" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currencyCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_workspaceId_code_key" ON "PriceList"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "PriceList_workspaceId_idx" ON "PriceList"("workspaceId");

-- CreateIndex
CREATE INDEX "PriceList_code_idx" ON "PriceList"("code");

-- CreateIndex
CREATE INDEX "PriceList_currencyCode_idx" ON "PriceList"("currencyCode");

-- CreateIndex
CREATE INDEX "PriceList_isDefault_idx" ON "PriceList"("isDefault");

-- CreateIndex
CREATE INDEX "PriceList_isActive_idx" ON "PriceList"("isActive");

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
