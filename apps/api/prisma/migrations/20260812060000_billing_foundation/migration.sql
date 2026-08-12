-- Evolve the existing SaaS invoice table without deleting historical invoices.
DROP INDEX "Invoice_number_key";

ALTER TABLE "Invoice"
ADD COLUMN "billingPeriod" VARCHAR(16),
ADD COLUMN "periodStart" TIMESTAMP(3),
ADD COLUMN "periodEnd" TIMESTAMP(3),
ADD COLUMN "subtotalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "Invoice"
SET
  "billingPeriod" = 'MONTHLY',
  "periodStart" = "issuedAt",
  "periodEnd" = "issuedAt" + INTERVAL '1 month',
  "subtotalAmount" = "totalAmount";

ALTER TABLE "Invoice"
ALTER COLUMN "billingPeriod" SET NOT NULL,
ALTER COLUMN "periodStart" SET NOT NULL,
ALTER COLUMN "periodEnd" SET NOT NULL;

CREATE UNIQUE INDEX "Invoice_workspaceId_number_key"
ON "Invoice"("workspaceId", "number");
CREATE UNIQUE INDEX "Invoice_workspaceId_subscriptionId_periodStart_periodEnd_key"
ON "Invoice"("workspaceId", "subscriptionId", "periodStart", "periodEnd");

CREATE TABLE "InvoiceLine" (
  "id" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "invoiceId" UUID NOT NULL,
  "taxId" UUID,
  "position" INTEGER NOT NULL,
  "description" VARCHAR(500) NOT NULL,
  "quantity" DECIMAL(12,4) NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "discountRate" DECIMAL(7,4) NOT NULL DEFAULT 0,
  "taxCode" VARCHAR(80),
  "taxName" VARCHAR(120),
  "taxRate" DECIMAL(7,4) NOT NULL DEFAULT 0,
  "subtotalAmount" DECIMAL(12,2) NOT NULL,
  "discountAmount" DECIMAL(12,2) NOT NULL,
  "taxAmount" DECIMAL(12,2) NOT NULL,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceNumberSequence" (
  "workspaceId" UUID NOT NULL,
  "nextValue" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvoiceNumberSequence_pkey" PRIMARY KEY ("workspaceId")
);

INSERT INTO "InvoiceNumberSequence" ("workspaceId", "nextValue", "createdAt", "updatedAt")
SELECT
  "workspaceId",
  COALESCE(
    MAX(
      CASE
        WHEN "number" ~ '^INV-[0-9]{6}$'
        THEN SUBSTRING("number" FROM 5)::INTEGER
        ELSE 0
      END
    ),
    0
  ) + 1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Invoice"
GROUP BY "workspaceId";

CREATE UNIQUE INDEX "InvoiceLine_invoiceId_position_key"
ON "InvoiceLine"("invoiceId", "position");
CREATE INDEX "InvoiceLine_workspaceId_idx" ON "InvoiceLine"("workspaceId");
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");
CREATE INDEX "InvoiceLine_taxId_idx" ON "InvoiceLine"("taxId");

ALTER TABLE "InvoiceLine"
ADD CONSTRAINT "InvoiceLine_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceLine"
ADD CONSTRAINT "InvoiceLine_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvoiceLine"
ADD CONSTRAINT "InvoiceLine_taxId_fkey"
FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InvoiceNumberSequence"
ADD CONSTRAINT "InvoiceNumberSequence_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
