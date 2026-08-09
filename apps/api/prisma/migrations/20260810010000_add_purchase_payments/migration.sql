-- CreateEnum
CREATE TYPE "PurchasePaymentStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchasePaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'CHECK', 'DIRECT_DEBIT', 'OTHER');

-- CreateTable
CREATE TABLE "PurchasePayment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "purchaseInvoiceId" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "paymentMethod" "PurchasePaymentMethod" NOT NULL,
    "status" "PurchasePaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "externalReference" TEXT,
    "notes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchasePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchasePayment_workspaceId_number_key" ON "PurchasePayment"("workspaceId", "number");
CREATE INDEX "PurchasePayment_workspaceId_idx" ON "PurchasePayment"("workspaceId");
CREATE INDEX "PurchasePayment_purchaseInvoiceId_idx" ON "PurchasePayment"("purchaseInvoiceId");
CREATE INDEX "PurchasePayment_status_idx" ON "PurchasePayment"("status");
CREATE INDEX "PurchasePayment_paymentDate_idx" ON "PurchasePayment"("paymentDate");
CREATE INDEX "PurchasePayment_paymentMethod_idx" ON "PurchasePayment"("paymentMethod");
CREATE INDEX "PurchasePayment_externalReference_idx" ON "PurchasePayment"("externalReference");

-- AddForeignKey
ALTER TABLE "PurchasePayment" ADD CONSTRAINT "PurchasePayment_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES "PurchaseInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
