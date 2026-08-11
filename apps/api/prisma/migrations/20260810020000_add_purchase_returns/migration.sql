-- CreateEnum
CREATE TYPE "PurchaseReturnStatus" AS ENUM ('DRAFT', 'READY', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PurchaseReturn" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "purchaseReceiptId" UUID NOT NULL,
    "status" "PurchaseReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT,
    "notes" TEXT,
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturnLine" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "purchaseReturnId" UUID NOT NULL,
    "purchaseReceiptLineId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseReturnLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReturn_workspaceId_number_key" ON "PurchaseReturn"("workspaceId", "number");
CREATE INDEX "PurchaseReturn_workspaceId_idx" ON "PurchaseReturn"("workspaceId");
CREATE INDEX "PurchaseReturn_purchaseReceiptId_idx" ON "PurchaseReturn"("purchaseReceiptId");
CREATE INDEX "PurchaseReturn_status_idx" ON "PurchaseReturn"("status");
CREATE INDEX "PurchaseReturn_returnedAt_idx" ON "PurchaseReturn"("returnedAt");
CREATE INDEX "PurchaseReturnLine_workspaceId_idx" ON "PurchaseReturnLine"("workspaceId");
CREATE INDEX "PurchaseReturnLine_purchaseReturnId_idx" ON "PurchaseReturnLine"("purchaseReturnId");
CREATE INDEX "PurchaseReturnLine_purchaseReceiptLineId_idx" ON "PurchaseReturnLine"("purchaseReceiptLineId");
CREATE INDEX "PurchaseReturnLine_inventoryItemId_idx" ON "PurchaseReturnLine"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_purchaseReceiptId_fkey" FOREIGN KEY ("purchaseReceiptId") REFERENCES "PurchaseReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturnLine" ADD CONSTRAINT "PurchaseReturnLine_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "PurchaseReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturnLine" ADD CONSTRAINT "PurchaseReturnLine_purchaseReceiptLineId_fkey" FOREIGN KEY ("purchaseReceiptLineId") REFERENCES "PurchaseReceiptLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturnLine" ADD CONSTRAINT "PurchaseReturnLine_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
