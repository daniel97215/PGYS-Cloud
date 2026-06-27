import { MemberRole, MemberStatus, WorkspaceStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkspaceRepository } from "../workspace.repository";

describe("WorkspaceRepository", () => {
  const workspace = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Garage Martin",
    displayName: "Garage Martin",
    legalName: null,
    siret: null,
    siren: null,
    vatNumber: null,
    addressLine1: null,
    addressLine2: null,
    postalCode: null,
    city: null,
    country: null,
    slug: "garage-martin",
    status: WorkspaceStatus.ACTIVE,
    billingEmail: null,
    phone: null,
    website: null,
    logoUrl: null,
    locale: "fr-FR",
    language: null,
    timezone: "Europe/Paris",
    currency: null,
    activity: null,
    companySize: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    closedAt: null,
  };

  it("creates an active workspace", async () => {
    const workspaceCreate = jest.fn().mockResolvedValue(workspace);
    const memberCreate = jest.fn().mockResolvedValue({});
    const settingsCreate = jest.fn().mockResolvedValue({});
    const prisma = createPrismaMock(
      workspaceCreate,
      memberCreate,
      settingsCreate,
    );
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
          displayName: workspace.name,
          slug: workspace.slug,
        }),
      }),
    );
  });

  it("creates the creator membership as OWNER", async () => {
    const workspaceCreate = jest.fn().mockResolvedValue(workspace);
    const memberCreate = jest.fn().mockResolvedValue({});
    const settingsCreate = jest.fn().mockResolvedValue({});
    const prisma = createPrismaMock(
      workspaceCreate,
      memberCreate,
      settingsCreate,
    );
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

  it("creates default workspace settings", async () => {
    const workspaceCreate = jest.fn().mockResolvedValue(workspace);
    const memberCreate = jest.fn().mockResolvedValue({});
    const settingsCreate = jest.fn().mockResolvedValue({});
    const prisma = createPrismaMock(
      workspaceCreate,
      memberCreate,
      settingsCreate,
    );
    const repository = new WorkspaceRepository(prisma);

    await repository.createWithOwner({
      name: workspace.name,
      slug: workspace.slug,
      creatorId: "20000000-0000-4000-8000-000000000001",
    });

    expect(settingsCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: workspace.id,
        language: "fr",
        timezone: "Europe/Paris",
        currency: "EUR",
        requireMfa: false,
        sessionTimeoutMinutes: 480,
        dateFormat: "dd/MM/yyyy",
        timeFormat: "HH:mm",
      }),
    });
  });
});

function createPrismaMock(
  workspaceCreate: jest.Mock,
  memberCreate: jest.Mock,
  settingsCreate: jest.Mock,
): PrismaService {
  const transaction = {
    workspace: { create: workspaceCreate },
    member: { create: memberCreate },
    workspaceSettings: { create: settingsCreate },
  };
  const prisma = {
    $transaction: jest.fn(
      async (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  };

  return prisma as unknown as PrismaService;
}
