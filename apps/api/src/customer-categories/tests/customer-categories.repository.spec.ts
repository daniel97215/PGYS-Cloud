import { PrismaService } from "../../prisma/prisma.service";
import { CustomerCategoriesRepository } from "../customer-categories.repository";

describe("CustomerCategoriesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const category = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "GRAND-COMPTE",
    name: "Grand Compte",
    description: "Strategic account category",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a customer category through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(category);
    const repository = new CustomerCategoriesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      code: category.code,
      name: category.name,
      description: category.description,
    });

    expect(result).toEqual(category);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: category.code,
        name: category.name,
        description: category.description,
      },
    });
  });

  it("updates a customer category through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(category);
    const repository = new CustomerCategoriesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, category.code, {
      name: "Collectivite",
    });

    expect(result).toEqual(category);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: category.code,
        },
      },
      data: { name: "Collectivite" },
    });
  });

  it("disables a customer category through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...category,
      isActive: false,
    });
    const repository = new CustomerCategoriesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.disable(workspaceId, category.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: category.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists customer categories for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([category]);
    const repository = new CustomerCategoriesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([category]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a customer category by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(category);
    const repository = new CustomerCategoriesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      category.code,
    );

    expect(result).toEqual(category);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: category.code,
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
    customerCategory: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
