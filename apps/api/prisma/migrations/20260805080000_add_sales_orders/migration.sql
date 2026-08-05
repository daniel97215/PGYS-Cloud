-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "businessPartnerId" UUID NOT NULL,
    "salesQuoteId" UUID,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL,
    "requestedDate" TIMESTAMP(3),
    "currencyCode" TEXT NOT NULL,
    "notes" TEXT,
    "subtotalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderLine" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "salesOrderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "taxRate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "subtotalAmount" DECIMAL(18,4) NOT NULL,
    "taxAmount" DECIMAL(18,4) NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_workspaceId_number_key" ON "SalesOrder"("workspaceId", "number");
CREATE UNIQUE INDEX "SalesOrder_salesQuoteId_key" ON "SalesOrder"("salesQuoteId");
CREATE INDEX "SalesOrder_workspaceId_idx" ON "SalesOrder"("workspaceId");
CREATE INDEX "SalesOrder_businessPartnerId_idx" ON "SalesOrder"("businessPartnerId");
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");
CREATE INDEX "SalesOrder_orderDate_idx" ON "SalesOrder"("orderDate");
CREATE INDEX "SalesOrderLine_workspaceId_idx" ON "SalesOrderLine"("workspaceId");
CREATE INDEX "SalesOrderLine_salesOrderId_idx" ON "SalesOrderLine"("salesOrderId");
CREATE INDEX "SalesOrderLine_productId_idx" ON "SalesOrderLine"("productId");
CREATE INDEX "SalesOrderLine_productVariantId_idx" ON "SalesOrderLine"("productVariantId");

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
