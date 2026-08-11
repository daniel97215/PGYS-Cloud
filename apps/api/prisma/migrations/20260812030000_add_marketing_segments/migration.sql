CREATE TABLE "MarketingSegment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "roleCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categoryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tagCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activeOnly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSegment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingSegment_workspaceId_code_key"
ON "MarketingSegment"("workspaceId", "code");

CREATE INDEX "MarketingSegment_workspaceId_idx"
ON "MarketingSegment"("workspaceId");

CREATE INDEX "MarketingSegment_name_idx"
ON "MarketingSegment"("name");

CREATE INDEX "MarketingSegment_isActive_idx"
ON "MarketingSegment"("isActive");

ALTER TABLE "MarketingSegment"
ADD CONSTRAINT "MarketingSegment_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
