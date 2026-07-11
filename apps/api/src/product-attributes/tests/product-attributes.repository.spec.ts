import { ProductAttributeValueType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ProductAttributesRepository } from "../product-attributes.repository";

describe("ProductAttributesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const productAttribute = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "COLOR",
    name: "Color",
    valueType: ProductAttributeValueType.TEXT,
    description: "Product color",
    isRequired: false,
    isVariantAxis: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a product attribute through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(productAttribute);
    const repository = new ProductAttributesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      code: productAttribute.code,
      name: productAttribute.name,
      valueType: productAttribute.valueType,
      description: productAttribute.description,
      isVariantAxis: productAttribute.isVariantAxis,
    });

    expect(result).toEqual(productAttribute);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: productAttribute.code,
        name: productAttribute.name,
        valueType: productAttribute.valueType,
        description: productAttribute.description,
        isVariantAxis: productAttribute.isVariantAxis,
      },
    });
  });

  it("updates a product attribute through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(productAttribute);
    const repository = new ProductAttributesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, productAttribute.code, {
      name: "Updated color",
    });

    expect(result).toEqual(productAttribute);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: productAttribute.code,
        },
      },
      data: { name: "Updated color" },
    });
  });

  it("deactivates a product attribute through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...productAttribute,
      isActive: false,
    });
    const repository = new ProductAttributesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.deactivate(
      workspaceId,
      productAttribute.code,
    );

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: productAttribute.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists product attributes through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([productAttribute]);
    const repository = new ProductAttributesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.list(workspaceId);

    expect(result).toEqual([productAttribute]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("gets a product attribute by code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(productAttribute);
    const repository = new ProductAttributesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.getByCode(workspaceId, productAttribute.code);

    expect(result).toEqual(productAttribute);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: productAttribute.code,
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
    productAttribute: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
