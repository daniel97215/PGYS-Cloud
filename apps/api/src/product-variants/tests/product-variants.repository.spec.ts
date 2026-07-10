import { PrismaService } from "../../prisma/prisma.service";
import { ProductVariantsRepository } from "../product-variants.repository";

describe("ProductVariantsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const productId = "20000000-0000-4000-8000-000000000001";
  const productVariant = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    productId,
    code: "PROD-001-RED",
    name: "Professional package - Red",
    sku: "SKU-001-RED",
    isDefault: false,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a product variant through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(productVariant);
    const repository = new ProductVariantsRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      productId,
      code: productVariant.code,
      name: productVariant.name,
      sku: productVariant.sku,
    });

    expect(result).toEqual(productVariant);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        productId,
        code: productVariant.code,
        name: productVariant.name,
        sku: productVariant.sku,
      },
    });
  });

  it("updates a product variant through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(productVariant);
    const repository = new ProductVariantsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, productVariant.code, {
      name: "Updated variant",
    });

    expect(result).toEqual(productVariant);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: productVariant.code,
        },
      },
      data: { name: "Updated variant" },
    });
  });

  it("deactivates a product variant through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...productVariant,
      isActive: false,
    });
    const repository = new ProductVariantsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.deactivate(
      workspaceId,
      productVariant.code,
    );

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: productVariant.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists product variants through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([productVariant]);
    const repository = new ProductVariantsRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByProduct(workspaceId, productId);

    expect(result).toEqual([productVariant]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, productId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a product variant by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(productVariant);
    const repository = new ProductVariantsRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      productVariant.code,
    );

    expect(result).toEqual(productVariant);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: productVariant.code,
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
    productVariant: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
