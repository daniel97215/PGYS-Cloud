-- CreateEnum
CREATE TYPE "SalesDeliveryStatus" AS ENUM ('DRAFT', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SalesDelivery" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "salesOrderId" UUID NOT NULL,
    "status" "SalesDeliveryStatus" NOT NULL DEFAULT 'DRAFT',
    "deliveryAddress" JSONB,
    "notes" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesDeliveryLine" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "salesDeliveryId" UUID NOT NULL,
    "salesOrderLineId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesDeliveryLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesDelivery_workspaceId_number_key" ON "SalesDelivery"("workspaceId", "number");
CREATE INDEX "SalesDelivery_workspaceId_idx" ON "SalesDelivery"("workspaceId");
CREATE INDEX "SalesDelivery_salesOrderId_idx" ON "SalesDelivery"("salesOrderId");
CREATE INDEX "SalesDelivery_status_idx" ON "SalesDelivery"("status");
CREATE UNIQUE INDEX "SalesDeliveryLine_salesDeliveryId_salesOrderLineId_inventoryItemId_key" ON "SalesDeliveryLine"("salesDeliveryId", "salesOrderLineId", "inventoryItemId");
CREATE INDEX "SalesDeliveryLine_workspaceId_idx" ON "SalesDeliveryLine"("workspaceId");
CREATE INDEX "SalesDeliveryLine_salesDeliveryId_idx" ON "SalesDeliveryLine"("salesDeliveryId");
CREATE INDEX "SalesDeliveryLine_salesOrderLineId_idx" ON "SalesDeliveryLine"("salesOrderLineId");
CREATE INDEX "SalesDeliveryLine_inventoryItemId_idx" ON "SalesDeliveryLine"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesDeliveryLine" ADD CONSTRAINT "SalesDeliveryLine_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesDeliveryLine" ADD CONSTRAINT "SalesDeliveryLine_salesOrderLineId_fkey" FOREIGN KEY ("salesOrderLineId") REFERENCES "SalesOrderLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesDeliveryLine" ADD CONSTRAINT "SalesDeliveryLine_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
