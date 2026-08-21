import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuditAction, PlatformOperatorRole, Prisma } from "@prisma/client";
import { PlatformAuditRepository } from "../platform-audit.repository";
import { PlatformAuditService } from "../platform-audit.service";

describe("PlatformAuditService", () => {
  let repository: jest.Mocked<PlatformAuditRepository>;
  let service: PlatformAuditService;

  const entry = {
    id: "50000000-0000-4000-8000-000000000001",
    action: AuditAction.UPDATED,
    targetType: "Workspace",
    targetId: "10000000-0000-4000-8000-000000000001",
    metadata: { changed: ["displayName"] } as Prisma.JsonValue,
    createdAt: new Date("2026-08-10T10:00:00.000Z"),
    workspace: {
      id: "10000000-0000-4000-8000-000000000001",
      displayName: "Garage Martin",
      slug: "garage-martin",
    },
    actor: {
      id: "60000000-0000-4000-8000-000000000001",
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@example.test",
    },
  };

  beforeEach(() => {
    repository = {
      search: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<PlatformAuditRepository>;
    service = new PlatformAuditService(repository);
  });

  it("maps actors and hides arbitrary metadata", async () => {
    repository.search.mockResolvedValue({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 25,
    });

    const result = await service.search(
      {},
      PlatformOperatorRole.PLATFORM_SUPPORT,
    );

    expect(result.items[0]).toEqual(
      expect.objectContaining({
        actor: expect.objectContaining({ displayName: "Alice Martin" }),
        metadataAvailable: true,
      }),
    );
    expect(result.items[0]).not.toHaveProperty("metadata");
  });

  it("rejects an inverted period", async () => {
    await expect(
      service.search(
        {
          from: "2026-08-31T00:00:00.000Z",
          to: "2026-08-01T00:00:00.000Z",
        },
        PlatformOperatorRole.PLATFORM_ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.search).not.toHaveBeenCalled();
  });

  it("rejects an unknown audit entry", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getOne(entry.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
