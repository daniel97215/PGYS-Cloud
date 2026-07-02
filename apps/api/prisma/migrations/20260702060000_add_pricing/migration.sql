-- CreateTable
CREATE TABLE "Price" (
    "id" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "amount" DECIMAL(12,2) NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Price_offerId_idx" ON "Price"("offerId");

-- CreateIndex
CREATE INDEX "Price_status_idx" ON "Price"("status");

-- CreateIndex
CREATE INDEX "Price_currency_idx" ON "Price"("currency");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
