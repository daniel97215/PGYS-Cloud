import { PrismaService } from "../../prisma/prisma.service";
import {
  WORKSPACE_SERVICE_STATUS_ACTIVE,
  WORKSPACE_SERVICE_STATUS_INACTIVE,
  WorkspaceServicesRepository,
} from "../workspace-services.repository";

describe("WorkspaceServicesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const serviceKey = "erp";
  const workspaceService = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    serviceKey,
    status: WORKSPACE_SERVICE_STATUS_ACTIVE,
    configuration: { defaultCurrency: "EUR" },
    activatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deactivatedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("lists services for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([workspaceService]);
    const repository = new WorkspaceServicesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([workspaceService]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
  });

  it("finds a service by workspace and key through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(workspaceService);
    const repository = new WorkspaceServicesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndServiceKey(
      workspaceId,
      serviceKey,
    );

    expect(result).toEqual(workspaceService);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
    });
  });

  it("activates a workspace service through Prisma", async () => {
    const upsert = jest.fn().mockResolvedValue(workspaceService);
    const repository = new WorkspaceServicesRepository(
      createPrismaMock({ upsert }),
    );

    const result = await repository.activate(workspaceId, serviceKey, {
      defaultCurrency: "EUR",
    });

    expect(result).toEqual(workspaceService);
    expect(upsert).toHaveBeenCalledWith({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
      create: expect.objectContaining({
        workspaceId,
        serviceKey,
        status: WORKSPACE_SERVICE_STATUS_ACTIVE,
        configuration: { defaultCurrency: "EUR" },
        activatedAt: expect.any(Date),
        deactivatedAt: null,
      }),
      update: expect.objectContaining({
        status: WORKSPACE_SERVICE_STATUS_ACTIVE,
        configuration: { defaultCurrency: "EUR" },
        activatedAt: expect.any(Date),
        deactivatedAt: null,
      }),
    });
  });

  it("disables a workspace service through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...workspaceService,
      status: WORKSPACE_SERVICE_STATUS_INACTIVE,
    });
    const repository = new WorkspaceServicesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.disable(workspaceId, serviceKey);

    expect(result.status).toBe(WORKSPACE_SERVICE_STATUS_INACTIVE);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
      data: {
        status: WORKSPACE_SERVICE_STATUS_INACTIVE,
        deactivatedAt: expect.any(Date),
      },
    });
  });

  it("updates service configuration through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(workspaceService);
    const repository = new WorkspaceServicesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.updateConfiguration(
      workspaceId,
      serviceKey,
      { defaultCurrency: "EUR" },
    );

    expect(result).toEqual(workspaceService);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
      data: {
        configuration: { defaultCurrency: "EUR" },
      },
    });
  });
});

function createPrismaMock(methods: {
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
  upsert?: jest.Mock;
  update?: jest.Mock;
}): PrismaService {
  const prisma = {
    workspaceService: {
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      upsert: methods.upsert ?? jest.fn(),
      update: methods.update ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}

