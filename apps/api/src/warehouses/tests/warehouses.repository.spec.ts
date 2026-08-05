import { PrismaService } from "../../prisma/prisma.service";
import { WarehousesRepository } from "../warehouses.repository";

describe("WarehousesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouse = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "MAIN",
    name: "Main warehouse",
    description: "Primary storage warehouse",
    address: { city: "Paris" },
    isDefault: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a warehouse through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(warehouse);
    const repository = new WarehousesRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: warehouse.code,
      name: warehouse.name,
      description: warehouse.description,
      address: warehouse.address,
      isDefault: warehouse.isDefault,
    });

    expect(result).toEqual(warehouse);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: warehouse.code,
        name: warehouse.name,
        description: warehouse.description,
        address: warehouse.address,
        isDefault: warehouse.isDefault,
      },
    });
  });

  it("updates a warehouse through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(warehouse);
    const repository = new WarehousesRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, warehouse.code, {
      name: "Updated warehouse",
    });

    expect(result).toEqual(warehouse);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: warehouse.code,
        },
      },
      data: { name: "Updated warehouse" },
    });
  });

  it("deactivates a warehouse through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({ ...warehouse, isActive: false });
    const repository = new WarehousesRepository(createPrismaMock({ update }));

    const result = await repository.deactivate(workspaceId, warehouse.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: warehouse.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists warehouses for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([warehouse]);
    const repository = new WarehousesRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([warehouse]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a warehouse by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(warehouse);
    const repository = new WarehousesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      warehouse.code,
    );

    expect(result).toEqual(warehouse);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: warehouse.code,
        },
      },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    warehouse: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
