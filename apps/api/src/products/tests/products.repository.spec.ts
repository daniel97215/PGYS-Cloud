import { ProductStatus, ProductType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ProductsRepository } from "../products.repository";

describe("ProductsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const product = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "PROD-001",
    name: "Professional service package",
    description: "Setup and support package",
    type: ProductType.PRODUCT,
    status: ProductStatus.ACTIVE,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a product through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(product);
    const repository = new ProductsRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: product.code,
      name: product.name,
      description: product.description,
      type: product.type,
    });

    expect(result).toEqual(product);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: product.code,
        name: product.name,
        description: product.description,
        type: product.type,
      },
    });
  });

  it("updates a product through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(product);
    const repository = new ProductsRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, product.code, {
      name: "Updated product",
    });

    expect(result).toEqual(product);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: product.code,
        },
      },
      data: { name: "Updated product" },
    });
  });

  it("archives a product through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...product,
      status: ProductStatus.INACTIVE,
    });
    const repository = new ProductsRepository(createPrismaMock({ update }));

    const result = await repository.archive(workspaceId, product.code);

    expect(result.status).toBe(ProductStatus.INACTIVE);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: product.code,
        },
      },
      data: { status: ProductStatus.INACTIVE },
    });
  });

  it("lists products for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([product]);
    const repository = new ProductsRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([product]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a product by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(product);
    const repository = new ProductsRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      product.code,
    );

    expect(result).toEqual(product);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: product.code,
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
    product: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
