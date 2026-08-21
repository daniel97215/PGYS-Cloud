import {
  PlatformOperatorRole,
  WorkspaceStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformAdministrationRepository } from "../platform-administration.repository";

describe("PlatformAdministrationRepository", () => {
  it("requires an active platform operator", async () => {
    const findFirst = jest.fn().mockResolvedValue({
      role: PlatformOperatorRole.PLATFORM_SUPPORT,
    });
    const repository = new PlatformAdministrationRepository({
      platformOperator: { findFirst },
    } as unknown as PrismaService);

    await expect(repository.findActiveOperator("user-1")).resolves.toEqual({
      role: PlatformOperatorRole.PLATFORM_SUPPORT,
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", active: true },
      select: { role: true },
    });
  });

  it("searches globally with closed filters and pagination", async () => {
    const items = [createWorkspaceRecord()];
    const findMany = jest.fn().mockResolvedValue(items);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new PlatformAdministrationRepository({
      workspace: { findMany, count },
    } as unknown as PrismaService);

    const result = await repository.searchWorkspaces({
      search: "garage",
      status: WorkspaceStatus.ACTIVE,
      page: 2,
      pageSize: 10,
    });

    expect(result).toEqual({ items, total: 1, page: 2, pageSize: 10 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: WorkspaceStatus.ACTIVE,
          OR: expect.any(Array),
        }),
        skip: 10,
        take: 10,
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({ status: WorkspaceStatus.ACTIVE }),
    });
  });
});

function createWorkspaceRecord() {
  return {
    id: "10000000-0000-4000-8000-000000000001",
    displayName: "Garage Martin",
    slug: "garage-martin",
    status: WorkspaceStatus.ACTIVE,
    billingEmail: "contact@garage.test",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    _count: { members: 3, services: 2 },
  };
}
