-- CreateTable
CREATE TABLE "ProductBarcode" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "productId" UUID,
    "productVariantId" UUID,
    "barcode" TEXT NOT NULL,
    "barcodeType" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBarcode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductBarcode_single_owner_check" CHECK (
        ("productId" IS NOT NULL AND "productVariantId" IS NULL)
        OR ("productId" IS NULL AND "productVariantId" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductBarcode_workspaceId_barcode_key" ON "ProductBarcode"("workspaceId", "barcode");

-- CreateIndex
CREATE INDEX "ProductBarcode_workspaceId_idx" ON "ProductBarcode"("workspaceId");

-- CreateIndex
CREATE INDEX "ProductBarcode_productId_idx" ON "ProductBarcode"("productId");

-- CreateIndex
CREATE INDEX "ProductBarcode_productVariantId_idx" ON "ProductBarcode"("productVariantId");

-- CreateIndex
CREATE INDEX "ProductBarcode_barcode_idx" ON "ProductBarcode"("barcode");

-- CreateIndex
CREATE INDEX "ProductBarcode_isPrimary_idx" ON "ProductBarcode"("isPrimary");

-- AddForeignKey
ALTER TABLE "ProductBarcode" ADD CONSTRAINT "ProductBarcode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBarcode" ADD CONSTRAINT "ProductBarcode_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
