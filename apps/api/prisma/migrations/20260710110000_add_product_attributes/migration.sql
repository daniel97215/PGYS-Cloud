-- CreateEnum
CREATE TYPE "ProductAttributeValueType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'LIST');

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "valueType" "ProductAttributeValueType" NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVariantAxis" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValue" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "productId" UUID,
    "productVariantId" UUID,
    "productAttributeId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductAttributeValue_single_owner_check" CHECK (
        ("productId" IS NOT NULL AND "productVariantId" IS NULL)
        OR ("productId" IS NULL AND "productVariantId" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_workspaceId_code_key" ON "ProductAttribute"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "ProductAttribute_workspaceId_idx" ON "ProductAttribute"("workspaceId");

-- CreateIndex
CREATE INDEX "ProductAttribute_code_idx" ON "ProductAttribute"("code");

-- CreateIndex
CREATE INDEX "ProductAttribute_isActive_idx" ON "ProductAttribute"("isActive");

-- CreateIndex
CREATE INDEX "ProductAttribute_isVariantAxis_idx" ON "ProductAttribute"("isVariantAxis");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_workspaceId_idx" ON "ProductAttributeValue"("workspaceId");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_productId_idx" ON "ProductAttributeValue"("productId");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_productVariantId_idx" ON "ProductAttributeValue"("productVariantId");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_productAttributeId_idx" ON "ProductAttributeValue"("productAttributeId");

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productAttributeId_fkey" FOREIGN KEY ("productAttributeId") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
