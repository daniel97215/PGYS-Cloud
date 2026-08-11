CREATE TABLE "BusinessPartnerCategoryAssignment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "businessPartnerId" UUID NOT NULL,
    "businessPartnerCategoryId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPartnerCategoryAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessPartnerCategoryAssignment_businessPartnerId_businessPartnerCategoryId_key"
ON "BusinessPartnerCategoryAssignment"("businessPartnerId", "businessPartnerCategoryId");

CREATE INDEX "BusinessPartnerCategoryAssignment_workspaceId_idx"
ON "BusinessPartnerCategoryAssignment"("workspaceId");

CREATE INDEX "BusinessPartnerCategoryAssignment_businessPartnerId_idx"
ON "BusinessPartnerCategoryAssignment"("businessPartnerId");

CREATE INDEX "BusinessPartnerCategoryAssignment_businessPartnerCategoryId_idx"
ON "BusinessPartnerCategoryAssignment"("businessPartnerCategoryId");

ALTER TABLE "BusinessPartnerCategoryAssignment"
ADD CONSTRAINT "BusinessPartnerCategoryAssignment_businessPartnerId_fkey"
FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BusinessPartnerCategoryAssignment"
ADD CONSTRAINT "BusinessPartnerCategoryAssignment_businessPartnerCategoryId_fkey"
FOREIGN KEY ("businessPartnerCategoryId") REFERENCES "BusinessPartnerCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
