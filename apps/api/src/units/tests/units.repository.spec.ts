import { PrismaService } from "../../prisma/prisma.service";
import { UnitsRepository } from "../units.repository";

describe("UnitsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const unit = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "PIECE",
    name: "Piece",
    symbol: "pc",
    description: "Single item unit",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a unit through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(unit);
    const repository = new UnitsRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
    });

    expect(result).toEqual(unit);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: unit.code,
        name: unit.name,
        symbol: unit.symbol,
        description: unit.description,
      },
    });
  });

  it("updates a unit through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(unit);
    const repository = new UnitsRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, unit.code, {
      name: "Unit piece",
    });

    expect(result).toEqual(unit);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: unit.code,
        },
      },
      data: { name: "Unit piece" },
    });
  });

  it("deactivates a unit through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...unit,
      isActive: false,
    });
    const repository = new UnitsRepository(createPrismaMock({ update }));

    const result = await repository.deactivate(workspaceId, unit.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: unit.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists units for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([unit]);
    const repository = new UnitsRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([unit]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a unit by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(unit);
    const repository = new UnitsRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      unit.code,
    );

    expect(result).toEqual(unit);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: unit.code,
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
    unit: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
