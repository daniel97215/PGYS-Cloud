import { PrismaService } from "../../prisma/prisma.service";
import { StorageLocationsRepository } from "../storage-locations.repository";

describe("StorageLocationsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "20000000-0000-4000-8000-000000000001";
  const storageLocation = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    warehouseId,
    code: "ZONE-A",
    name: "Zone A",
    description: "Ground-floor storage zone",
    locationType: "ZONE",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a storage location through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(storageLocation);
    const repository = new StorageLocationsRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      warehouseId,
      code: storageLocation.code,
      name: storageLocation.name,
      description: storageLocation.description,
      locationType: storageLocation.locationType,
    });

    expect(result).toEqual(storageLocation);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        warehouseId,
        code: storageLocation.code,
        name: storageLocation.name,
        description: storageLocation.description,
        locationType: storageLocation.locationType,
      },
    });
  });

  it("updates a workspace-scoped storage location through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(storageLocation);
    const repository = new StorageLocationsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(
      workspaceId,
      warehouseId,
      storageLocation.code,
      { name: "Updated zone" },
    );

    expect(result).toEqual(storageLocation);
    expect(update).toHaveBeenCalledWith({
      where: {
        warehouseId_code: { warehouseId, code: storageLocation.code },
        workspaceId,
      },
      data: { name: "Updated zone" },
    });
  });

  it("deactivates a workspace-scoped storage location through Prisma", async () => {
    const update = jest
      .fn()
      .mockResolvedValue({ ...storageLocation, isActive: false });
    const repository = new StorageLocationsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.deactivate(
      workspaceId,
      warehouseId,
      storageLocation.code,
    );

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        warehouseId_code: { warehouseId, code: storageLocation.code },
        workspaceId,
      },
      data: { isActive: false },
    });
  });

  it("lists storage locations for a warehouse and workspace", async () => {
    const findMany = jest.fn().mockResolvedValue([storageLocation]);
    const repository = new StorageLocationsRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWarehouse(workspaceId, warehouseId);

    expect(result).toEqual([storageLocation]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, warehouseId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a storage location by warehouse, workspace, and code", async () => {
    const findFirst = jest.fn().mockResolvedValue(storageLocation);
    const repository = new StorageLocationsRepository(
      createPrismaMock({ storageLocationFindFirst: findFirst }),
    );

    const result = await repository.findByWarehouseAndCode(
      workspaceId,
      warehouseId,
      storageLocation.code,
    );

    expect(result).toEqual(storageLocation);
    expect(findFirst).toHaveBeenCalledWith({
      where: { workspaceId, warehouseId, code: storageLocation.code },
    });
  });

  it("checks that the warehouse belongs to the workspace", async () => {
    const findFirst = jest.fn().mockResolvedValue({ id: warehouseId });
    const repository = new StorageLocationsRepository(
      createPrismaMock({ warehouseFindFirst: findFirst }),
    );

    const result = await repository.warehouseBelongsToWorkspace(
      workspaceId,
      warehouseId,
    );

    expect(result).toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: warehouseId, workspaceId },
      select: { id: true },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  storageLocationFindFirst?: jest.Mock;
  warehouseFindFirst?: jest.Mock;
}): PrismaService {
  const prisma = {
    storageLocation: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.storageLocationFindFirst ?? jest.fn(),
    },
    warehouse: {
      findFirst: methods.warehouseFindFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
