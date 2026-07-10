-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX IF EXISTS "Product_code_key";

-- DropIndex
DROP INDEX IF EXISTS "Product_serviceType_isActive_idx";

-- AlterTable
ALTER TABLE "Product"
  DROP COLUMN "serviceType",
  DROP COLUMN "isActive",
  ADD COLUMN "workspaceId" UUID NOT NULL,
  ADD COLUMN "type" "ProductType" NOT NULL,
  ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "Product_workspaceId_code_key" ON "Product"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "Product_workspaceId_idx" ON "Product"("workspaceId");

-- CreateIndex
CREATE INDEX "Product_code_idx" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
