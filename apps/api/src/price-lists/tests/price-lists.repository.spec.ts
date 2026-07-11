import { PrismaService } from "../../prisma/prisma.service";
import { PriceListsRepository } from "../price-lists.repository";

describe("PriceListsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const priceList = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "PUBLIC",
    name: "Public price list",
    description: "Default public prices",
    currencyCode: "EUR",
    isDefault: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a price list through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(priceList);
    const repository = new PriceListsRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: priceList.code,
      name: priceList.name,
      description: priceList.description,
      currencyCode: priceList.currencyCode,
      isDefault: priceList.isDefault,
    });

    expect(result).toEqual(priceList);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: priceList.code,
        name: priceList.name,
        description: priceList.description,
        currencyCode: priceList.currencyCode,
        isDefault: priceList.isDefault,
      },
    });
  });

  it("updates a price list through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(priceList);
    const repository = new PriceListsRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, priceList.code, {
      name: "Updated price list",
    });

    expect(result).toEqual(priceList);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: priceList.code,
        },
      },
      data: { name: "Updated price list" },
    });
  });

  it("deactivates a price list through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({ ...priceList, isActive: false });
    const repository = new PriceListsRepository(createPrismaMock({ update }));

    const result = await repository.deactivate(workspaceId, priceList.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: priceList.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists price lists for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([priceList]);
    const repository = new PriceListsRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([priceList]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a price list by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(priceList);
    const repository = new PriceListsRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      priceList.code,
    );

    expect(result).toEqual(priceList);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: priceList.code,
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
    priceList: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
