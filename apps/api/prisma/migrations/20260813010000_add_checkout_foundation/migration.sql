-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('OPEN', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "priceId" UUID NOT NULL,
    "subscriptionId" UUID,
    "invoiceId" UUID,
    "idempotencyKey" VARCHAR(120) NOT NULL,
    "status" "CheckoutStatus" NOT NULL DEFAULT 'OPEN',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "billingPeriod" VARCHAR(16) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_subscriptionId_key" ON "CheckoutSession"("subscriptionId");
CREATE UNIQUE INDEX "CheckoutSession_invoiceId_key" ON "CheckoutSession"("invoiceId");
CREATE UNIQUE INDEX "CheckoutSession_workspaceId_idempotencyKey_key" ON "CheckoutSession"("workspaceId", "idempotencyKey");
CREATE INDEX "CheckoutSession_workspaceId_status_idx" ON "CheckoutSession"("workspaceId", "status");
CREATE INDEX "CheckoutSession_offerId_idx" ON "CheckoutSession"("offerId");
CREATE INDEX "CheckoutSession_priceId_idx" ON "CheckoutSession"("priceId");
CREATE INDEX "CheckoutSession_expiresAt_idx" ON "CheckoutSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
