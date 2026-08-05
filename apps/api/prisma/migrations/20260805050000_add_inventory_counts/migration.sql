-- CreateEnum
CREATE TYPE "InventoryCountStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "InventoryCount" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "storageLocationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "status" "InventoryCountStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCountLine" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "inventoryCountId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "expectedQuantity" DECIMAL(18,4) NOT NULL,
    "countedQuantity" DECIMAL(18,4),
    "variance" DECIMAL(18,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCount_workspaceId_code_key" ON "InventoryCount"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "InventoryCount_workspaceId_idx" ON "InventoryCount"("workspaceId");

-- CreateIndex
CREATE INDEX "InventoryCount_warehouseId_idx" ON "InventoryCount"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryCount_storageLocationId_idx" ON "InventoryCount"("storageLocationId");

-- CreateIndex
CREATE INDEX "InventoryCount_status_idx" ON "InventoryCount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCountLine_inventoryCountId_inventoryItemId_key" ON "InventoryCountLine"("inventoryCountId", "inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryCountLine_workspaceId_idx" ON "InventoryCountLine"("workspaceId");

-- CreateIndex
CREATE INDEX "InventoryCountLine_inventoryCountId_idx" ON "InventoryCountLine"("inventoryCountId");

-- CreateIndex
CREATE INDEX "InventoryCountLine_inventoryItemId_idx" ON "InventoryCountLine"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_inventoryCountId_fkey" FOREIGN KEY ("inventoryCountId") REFERENCES "InventoryCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
