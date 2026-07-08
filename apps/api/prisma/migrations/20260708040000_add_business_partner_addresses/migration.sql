-- CreateTable
CREATE TABLE "BusinessPartnerAddress" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "countryCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_workspaceId_idx" ON "BusinessPartnerAddress"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_customerId_idx" ON "BusinessPartnerAddress"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_postalCode_idx" ON "BusinessPartnerAddress"("postalCode");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_city_idx" ON "BusinessPartnerAddress"("city");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_countryCode_idx" ON "BusinessPartnerAddress"("countryCode");

-- AddForeignKey
ALTER TABLE "BusinessPartnerAddress" ADD CONSTRAINT "BusinessPartnerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
