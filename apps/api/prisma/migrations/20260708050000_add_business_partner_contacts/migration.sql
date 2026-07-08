-- CreateTable
CREATE TABLE "BusinessPartnerContact" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerContact_workspaceId_idx" ON "BusinessPartnerContact"("workspaceId");

-- CreateIndex
CREATE INDEX "BusinessPartnerContact_customerId_idx" ON "BusinessPartnerContact"("customerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerContact_email_idx" ON "BusinessPartnerContact"("email");

-- CreateIndex
CREATE INDEX "BusinessPartnerContact_lastName_idx" ON "BusinessPartnerContact"("lastName");

-- CreateIndex
CREATE INDEX "BusinessPartnerContact_isActive_idx" ON "BusinessPartnerContact"("isActive");

-- AddForeignKey
ALTER TABLE "BusinessPartnerContact" ADD CONSTRAINT "BusinessPartnerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
