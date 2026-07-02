-- CreateTable
CREATE TABLE "OfferFeature" (
    "id" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfferFeature_offerId_featureId_key" ON "OfferFeature"("offerId", "featureId");

-- CreateIndex
CREATE INDEX "OfferFeature_offerId_idx" ON "OfferFeature"("offerId");

-- CreateIndex
CREATE INDEX "OfferFeature_featureId_idx" ON "OfferFeature"("featureId");

-- AddForeignKey
ALTER TABLE "OfferFeature" ADD CONSTRAINT "OfferFeature_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferFeature" ADD CONSTRAINT "OfferFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
