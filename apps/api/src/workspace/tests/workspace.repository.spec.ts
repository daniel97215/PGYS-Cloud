import { MemberRole, MemberStatus, WorkspaceStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkspaceRepository } from "../workspace.repository";

describe("WorkspaceRepository", () => {
  const workspace = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Garage Martin",
    slug: "garage-martin",
    status: WorkspaceStatus.ACTIVE,
    billingEmail: null,
    phone: null,
    locale: "fr-FR",
    timezone: "Europe/Paris",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    closedAt: null,
  };

  it("creates an active workspace", async () => {
    const workspaceCreate = jest.fn().mockResolvedValue(workspace);
    const memberCreate = jest.fn().mockResolvedValue({});
    const prisma = createPrismaMock(workspaceCreate, memberCreate);
    const repository = new WorkspaceRepository(prisma);

    const result = await repository.createWithOwner({
      name: workspace.name,
      slug: workspace.slug,
      creatorId: "20000000-0000-4000-8000-000000000001",
    });

    expect(result).toEqual(workspace);
    expect(workspaceCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: WorkspaceStatus.ACTIVE,
          slug: workspace.slug,
        }),
      }),
    );
  });

  it("creates the creator membership as OWNER", async () => {
    const workspaceCreate = jest.fn().mockResolvedValue(workspace);
    const memberCreate = jest.fn().mockResolvedValue({});
    const prisma = createPrismaMock(workspaceCreate, memberCreate);
    const repository = new WorkspaceRepository(prisma);
    const creatorId = "20000000-0000-4000-8000-000000000001";

    await repository.createWithOwner({
      name: workspace.name,
      slug: workspace.slug,
      creatorId,
    });

    expect(memberCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: workspace.id,
        userId: creatorId,
        role: MemberRole.OWNER,
        status: MemberStatus.ACTIVE,
      }),
    });
  });
});

function createPrismaMock(
  workspaceCreate: jest.Mock,
  memberCreate: jest.Mock,
): PrismaService {
  const transaction = {
    workspace: { create: workspaceCreate },
    member: { create: memberCreate },
  };
  const prisma = {
    $transaction: jest.fn(
      async (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  };

  return prisma as unknown as PrismaService;
}
