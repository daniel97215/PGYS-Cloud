import { PrismaService } from "../../prisma/prisma.service";
import { BrandsRepository } from "../brands.repository";

describe("BrandsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const brand = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "ACME",
    name: "Acme",
    description: "Acme product brand",
    websiteUrl: "https://example.com",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a brand through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(brand);
    const repository = new BrandsRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: brand.code,
      name: brand.name,
      description: brand.description,
      websiteUrl: brand.websiteUrl,
    });

    expect(result).toEqual(brand);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: brand.code,
        name: brand.name,
        description: brand.description,
        websiteUrl: brand.websiteUrl,
      },
    });
  });

  it("updates a brand through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(brand);
    const repository = new BrandsRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, brand.code, {
      name: "Acme Pro",
    });

    expect(result).toEqual(brand);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: brand.code,
        },
      },
      data: { name: "Acme Pro" },
    });
  });

  it("deactivates a brand through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...brand,
      isActive: false,
    });
    const repository = new BrandsRepository(createPrismaMock({ update }));

    const result = await repository.deactivate(workspaceId, brand.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: brand.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists brands for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([brand]);
    const repository = new BrandsRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([brand]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a brand by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(brand);
    const repository = new BrandsRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      brand.code,
    );

    expect(result).toEqual(brand);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: brand.code,
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
    brand: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
