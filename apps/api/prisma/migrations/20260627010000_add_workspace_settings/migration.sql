-- CreateTable
CREATE TABLE "WorkspaceSettings" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "language" VARCHAR(2) NOT NULL DEFAULT 'fr',
    "timezone" VARCHAR(80) NOT NULL DEFAULT 'Europe/Paris',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "requireMfa" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 480,
    "dateFormat" VARCHAR(32) NOT NULL DEFAULT 'dd/MM/yyyy',
    "timeFormat" VARCHAR(32) NOT NULL DEFAULT 'HH:mm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSettings_pkey" PRIMARY KEY ("id")
);

-- Backfill settings for existing workspaces.
INSERT INTO "WorkspaceSettings" (
    "id",
    "workspaceId",
    "language",
    "timezone",
    "currency",
    "requireMfa",
    "sessionTimeoutMinutes",
    "dateFormat",
    "timeFormat",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "id",
    COALESCE("language", 'fr'),
    "timezone",
    COALESCE("currency", 'EUR'),
    false,
    480,
    'dd/MM/yyyy',
    'HH:mm',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Workspace";

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSettings_workspaceId_key" ON "WorkspaceSettings"("workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceSettings" ADD CONSTRAINT "WorkspaceSettings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
