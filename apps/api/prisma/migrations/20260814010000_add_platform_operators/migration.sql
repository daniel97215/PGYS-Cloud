CREATE TYPE "PlatformOperatorRole" AS ENUM ('PLATFORM_ADMIN', 'PLATFORM_SUPPORT');

CREATE TABLE "PlatformOperator" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "PlatformOperatorRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformOperator_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformOperator_userId_key" ON "PlatformOperator"("userId");
CREATE INDEX "PlatformOperator_active_role_idx" ON "PlatformOperator"("active", "role");

ALTER TABLE "PlatformOperator"
ADD CONSTRAINT "PlatformOperator_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
