-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT IF EXISTS "Service_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_productId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_workspaceId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_productId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_status_endsAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_workspaceId_status_idx";

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE TEXT USING LOWER("status"::text);
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "Subscription" RENAME COLUMN "startsAt" TO "startedAt";
ALTER TABLE "Subscription" ADD COLUMN "offerId" UUID NOT NULL;
ALTER TABLE "Subscription" ADD COLUMN "priceId" UUID;
ALTER TABLE "Subscription" ADD COLUMN "renewalDate" TIMESTAMP(3);
ALTER TABLE "Subscription" DROP COLUMN "productId";
ALTER TABLE "Subscription" DROP COLUMN "priceAmount";
ALTER TABLE "Subscription" DROP COLUMN "currency";
ALTER TABLE "Subscription" DROP COLUMN "discountAmount";
ALTER TABLE "Subscription" DROP COLUMN "discountPercent";
ALTER TABLE "Subscription" DROP COLUMN "billingInterval";
ALTER TABLE "Subscription" DROP COLUMN "termsSnapshot";

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_idx" ON "Subscription"("workspaceId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_renewalDate_idx" ON "Subscription"("renewalDate");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspaceId_offerId_active_key" ON "Subscription"("workspaceId", "offerId") WHERE "status" = 'active';

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;
