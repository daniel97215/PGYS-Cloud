-- CreateEnum
CREATE TYPE "SalesQuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SalesQuote" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "businessPartnerId" UUID NOT NULL,
    "status" "SalesQuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "currencyCode" TEXT NOT NULL,
    "notes" TEXT,
    "subtotalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesQuoteLine" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "salesQuoteId" UUID NOT NULL,
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

    CONSTRAINT "SalesQuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesQuote_workspaceId_number_key" ON "SalesQuote"("workspaceId", "number");
CREATE INDEX "SalesQuote_workspaceId_idx" ON "SalesQuote"("workspaceId");
CREATE INDEX "SalesQuote_businessPartnerId_idx" ON "SalesQuote"("businessPartnerId");
CREATE INDEX "SalesQuote_status_idx" ON "SalesQuote"("status");
CREATE INDEX "SalesQuote_issueDate_idx" ON "SalesQuote"("issueDate");
CREATE INDEX "SalesQuoteLine_workspaceId_idx" ON "SalesQuoteLine"("workspaceId");
CREATE INDEX "SalesQuoteLine_salesQuoteId_idx" ON "SalesQuoteLine"("salesQuoteId");
CREATE INDEX "SalesQuoteLine_productId_idx" ON "SalesQuoteLine"("productId");
CREATE INDEX "SalesQuoteLine_productVariantId_idx" ON "SalesQuoteLine"("productVariantId");

-- AddForeignKey
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteLine" ADD CONSTRAINT "SalesQuoteLine_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteLine" ADD CONSTRAINT "SalesQuoteLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteLine" ADD CONSTRAINT "SalesQuoteLine_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
