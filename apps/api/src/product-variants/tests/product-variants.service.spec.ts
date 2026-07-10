import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductVariantsRepository } from "../product-variants.repository";
import { ProductVariantsService } from "../product-variants.service";

describe("ProductVariantsService", () => {
  let repository: jest.Mocked<ProductVariantsRepository>;
  let service: ProductVariantsService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(productVariant),
      update: jest.fn().mockResolvedValue(productVariant),
      deactivate: jest.fn().mockResolvedValue({
        ...productVariant,
        isActive: false,
      }),
      findByProduct: jest.fn().mockResolvedValue([productVariant]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(productVariant),
    } as unknown as jest.Mocked<ProductVariantsRepository>;

    service = new ProductVariantsService(repository);
  });

  it("creates a product variant", async () => {
    const result = await service.create(workspaceId, productId, {
      code: "prod-001-red",
      name: productVariant.name,
      sku: productVariant.sku,
    });

    expect(result).toEqual(productVariant);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      productId,
      code: productVariant.code,
      name: productVariant.name,
      sku: productVariant.sku,
    });
  });

  it("updates a product variant", async () => {
    const result = await service.update(workspaceId, productVariant.code, {
      name: "Updated variant",
    });

    expect(result).toEqual(productVariant);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      productVariant.code,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      productVariant.code,
      { name: "Updated variant" },
    );
  });

  it("lists variants by product", async () => {
    const result = await service.listByProduct(workspaceId, productId);

    expect(result).toEqual([productVariant]);
    expect(repository.findByProduct).toHaveBeenCalledWith(
      workspaceId,
      productId,
    );
  });

  it("gets a product variant by code", async () => {
    const result = await service.getByCode(workspaceId, productVariant.code);

    expect(result).toEqual(productVariant);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      productVariant.code,
    );
  });

  it("deactivates a product variant", async () => {
    const result = await service.deactivate(workspaceId, productVariant.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      productVariant.code,
    );
  });

  it("throws NotFoundException when product variant is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

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
