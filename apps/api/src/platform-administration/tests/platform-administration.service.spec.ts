import { NotFoundException } from "@nestjs/common";
import {
  PlatformOperatorRole,
  WorkspaceStatus,
} from "@prisma/client";
import { PlatformAdministrationRepository } from "../platform-administration.repository";
import { PlatformAdministrationService } from "../platform-administration.service";

describe("PlatformAdministrationService", () => {
  let repository: jest.Mocked<PlatformAdministrationRepository>;
  let service: PlatformAdministrationService;

  const workspace = {
    id: "10000000-0000-4000-8000-000000000001",
    displayName: "Garage Martin",
    slug: "garage-martin",
    status: WorkspaceStatus.ACTIVE,
    billingEmail: "contact@garage.test",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    _count: { members: 3, services: 2 },
  };

  beforeEach(() => {
    repository = {
      findActiveOperator: jest.fn(),
      searchWorkspaces: jest.fn(),
      findWorkspaceById: jest.fn(),
    } as unknown as jest.Mocked<PlatformAdministrationRepository>;
    service = new PlatformAdministrationService(repository);
  });

  it("exposes the operator role and maps counts", async () => {
    repository.searchWorkspaces.mockResolvedValue({
      items: [workspace],
      total: 1,
      page: 1,
      pageSize: 25,
    });

    const result = await service.searchWorkspaces(
      {},
      PlatformOperatorRole.PLATFORM_SUPPORT,
    );

    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: workspace.id,
          memberCount: 3,
          serviceCount: 2,
        }),
      ],
      total: 1,
      page: 1,
      pageSize: 25,
      accessRole: PlatformOperatorRole.PLATFORM_SUPPORT,
    });
  });

  it("rejects an unknown workspace", async () => {
    repository.findWorkspaceById.mockResolvedValue(null);

    await expect(service.getWorkspace(workspace.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
