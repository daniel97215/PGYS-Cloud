-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN "displayName" VARCHAR(120);

UPDATE "Workspace"
SET "displayName" = "name";

ALTER TABLE "Workspace" ALTER COLUMN "displayName" SET NOT NULL;

ALTER TABLE "Workspace"
  ADD COLUMN "legalName" TEXT,
  ADD COLUMN "siret" VARCHAR(14),
  ADD COLUMN "siren" VARCHAR(9),
  ADD COLUMN "vatNumber" VARCHAR(32),
  ADD COLUMN "addressLine1" TEXT,
  ADD COLUMN "addressLine2" TEXT,
  ADD COLUMN "postalCode" VARCHAR(20),
  ADD COLUMN "city" TEXT,
  ADD COLUMN "country" VARCHAR(80),
  ADD COLUMN "website" VARCHAR(2048),
  ADD COLUMN "logoUrl" VARCHAR(2048),
  ADD COLUMN "language" VARCHAR(2),
  ADD COLUMN "currency" VARCHAR(3),
  ADD COLUMN "activity" TEXT,
  ADD COLUMN "companySize" VARCHAR(80);
