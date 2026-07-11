import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductAttributeValueType } from "@prisma/client";
import { ProductAttributesRepository } from "../product-attributes.repository";
import { ProductAttributesService } from "../product-attributes.service";

describe("ProductAttributesService", () => {
  let repository: jest.Mocked<ProductAttributesRepository>;
  let service: ProductAttributesService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(productAttribute),
      update: jest.fn().mockResolvedValue(productAttribute),
      deactivate: jest.fn().mockResolvedValue({
        ...productAttribute,
        isActive: false,
      }),
      list: jest.fn().mockResolvedValue([productAttribute]),
      getByCode: jest.fn().mockResolvedValue(productAttribute),
    } as unknown as jest.Mocked<ProductAttributesRepository>;

    service = new ProductAttributesService(repository);
  });

  it("creates a product attribute", async () => {
    const result = await service.create(workspaceId, {
      code: "color",
      name: productAttribute.name,
      valueType: productAttribute.valueType,
      description: productAttribute.description,
      isVariantAxis: productAttribute.isVariantAxis,
    });

    expect(result).toEqual(productAttribute);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: productAttribute.code,
      name: productAttribute.name,
      valueType: productAttribute.valueType,
      description: productAttribute.description,
      isVariantAxis: productAttribute.isVariantAxis,
    });
  });

  it("updates a product attribute", async () => {
    const result = await service.update(workspaceId, productAttribute.code, {
      name: "Updated color",
    });

    expect(result).toEqual(productAttribute);
    expect(repository.getByCode).toHaveBeenCalledWith(
      workspaceId,
      productAttribute.code,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      productAttribute.code,
      { name: "Updated color", valueType: undefined },
    );
  });

  it("lists product attributes", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([productAttribute]);
    expect(repository.list).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a product attribute by code", async () => {
    const result = await service.getByCode(workspaceId, productAttribute.code);

    expect(result).toEqual(productAttribute);
    expect(repository.getByCode).toHaveBeenCalledWith(
      workspaceId,
      productAttribute.code,
    );
  });

  it("deactivates a product attribute", async () => {
    const result = await service.deactivate(workspaceId, productAttribute.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      productAttribute.code,
    );
  });

  it("throws NotFoundException when product attribute is unknown", async () => {
    repository.getByCode.mockResolvedValueOnce(null);

    await expect(
      service.getByCode(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getByCode(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
