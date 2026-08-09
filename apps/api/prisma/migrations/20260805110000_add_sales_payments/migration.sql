-- CreateEnum
CREATE TYPE "SalesPaymentStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesPaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'CHECK', 'DIRECT_DEBIT', 'OTHER');

-- CreateTable
CREATE TABLE "SalesPayment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "businessPartnerId" UUID NOT NULL,
    "status" "SalesPaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "method" "SalesPaymentMethod" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "externalReference" TEXT,
    "notes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesPaymentAllocation" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "salesPaymentId" UUID NOT NULL,
    "salesInvoiceId" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesPaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesPayment_workspaceId_number_key" ON "SalesPayment"("workspaceId", "number");
CREATE INDEX "SalesPayment_workspaceId_idx" ON "SalesPayment"("workspaceId");
CREATE INDEX "SalesPayment_businessPartnerId_idx" ON "SalesPayment"("businessPartnerId");
CREATE INDEX "SalesPayment_status_idx" ON "SalesPayment"("status");
CREATE INDEX "SalesPayment_paymentDate_idx" ON "SalesPayment"("paymentDate");
CREATE INDEX "SalesPayment_externalReference_idx" ON "SalesPayment"("externalReference");
CREATE UNIQUE INDEX "SalesPaymentAllocation_salesPaymentId_salesInvoiceId_key" ON "SalesPaymentAllocation"("salesPaymentId", "salesInvoiceId");
CREATE INDEX "SalesPaymentAllocation_workspaceId_idx" ON "SalesPaymentAllocation"("workspaceId");
CREATE INDEX "SalesPaymentAllocation_salesPaymentId_idx" ON "SalesPaymentAllocation"("salesPaymentId");
CREATE INDEX "SalesPaymentAllocation_salesInvoiceId_idx" ON "SalesPaymentAllocation"("salesInvoiceId");

-- AddForeignKey
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesPaymentAllocation" ADD CONSTRAINT "SalesPaymentAllocation_salesPaymentId_fkey" FOREIGN KEY ("salesPaymentId") REFERENCES "SalesPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesPaymentAllocation" ADD CONSTRAINT "SalesPaymentAllocation_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
