-- CreateTable
CREATE TABLE "ProductMedia" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "productId" UUID,
    "productVariantId" UUID,
    "name" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductMedia_single_owner_check" CHECK (
        ("productId" IS NOT NULL AND "productVariantId" IS NULL)
        OR ("productId" IS NULL AND "productVariantId" IS NOT NULL)
    )
);

-- CreateIndex
CREATE INDEX "ProductMedia_workspaceId_idx" ON "ProductMedia"("workspaceId");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_idx" ON "ProductMedia"("productId");

-- CreateIndex
CREATE INDEX "ProductMedia_productVariantId_idx" ON "ProductMedia"("productVariantId");

-- CreateIndex
CREATE INDEX "ProductMedia_mediaType_idx" ON "ProductMedia"("mediaType");

-- CreateIndex
CREATE INDEX "ProductMedia_isPrimary_idx" ON "ProductMedia"("isPrimary");

-- CreateIndex
CREATE INDEX "ProductMedia_sortOrder_idx" ON "ProductMedia"("sortOrder");

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
