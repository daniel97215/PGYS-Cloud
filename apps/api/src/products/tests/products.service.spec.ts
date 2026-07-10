import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductStatus, ProductType } from "@prisma/client";
import { ProductsRepository } from "../products.repository";
import { ProductsService } from "../products.service";

describe("ProductsService", () => {
  let repository: jest.Mocked<ProductsRepository>;
  let service: ProductsService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue(product),
      archive: jest.fn().mockResolvedValue({
        ...product,
        status: ProductStatus.INACTIVE,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([product]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(product),
    } as unknown as jest.Mocked<ProductsRepository>;

    service = new ProductsService(repository);
  });

  it("creates a product", async () => {
    const result = await service.create(workspaceId, {
      code: "prod-001",
      name: product.name,
      description: product.description,
      type: ProductType.PRODUCT,
    });

    expect(result).toEqual(product);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: product.code,
      name: product.name,
      description: product.description,
      type: product.type,
      status: undefined,
    });
  });

  it("updates a product", async () => {
    const result = await service.update(workspaceId, product.code, {
      name: "Updated product",
    });

    expect(result).toEqual(product);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      product.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, product.code, {
      name: "Updated product",
      type: undefined,
      status: undefined,
    });
  });

  it("lists products", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([product]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a product by code", async () => {
    const result = await service.getByCode(workspaceId, product.code);

    expect(result).toEqual(product);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      product.code,
    );
  });

  it("archives a product", async () => {
    const result = await service.archive(workspaceId, product.code);

    expect(result.status).toBe(ProductStatus.INACTIVE);
    expect(repository.archive).toHaveBeenCalledWith(workspaceId, product.code);
  });

  it("throws NotFoundException when product is unknown", async () => {
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
