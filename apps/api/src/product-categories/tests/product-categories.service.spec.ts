import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductCategoriesRepository } from "../product-categories.repository";
import { ProductCategoriesService } from "../product-categories.service";

describe("ProductCategoriesService", () => {
  let repository: jest.Mocked<ProductCategoriesRepository>;
  let service: ProductCategoriesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const category = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "SERVICES",
    name: "Services",
    description: "Service catalog items",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(category),
      update: jest.fn().mockResolvedValue(category),
      deactivate: jest.fn().mockResolvedValue({
        ...category,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([category]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(category),
    } as unknown as jest.Mocked<ProductCategoriesRepository>;

    service = new ProductCategoriesService(repository);
  });

  it("creates a product category", async () => {
    const result = await service.create(workspaceId, {
      code: "services",
      name: category.name,
      description: category.description,
    });

    expect(result).toEqual(category);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: category.code,
      name: category.name,
      description: category.description,
    });
  });

  it("updates a product category", async () => {
    const result = await service.update(workspaceId, category.code, {
      name: "Services Pro",
    });

    expect(result).toEqual(category);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      category.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, category.code, {
      name: "Services Pro",
    });
  });

  it("lists product categories", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([category]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a product category by code", async () => {
    const result = await service.getByCode(workspaceId, category.code);

    expect(result).toEqual(category);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      category.code,
    );
  });

  it("deactivates a product category", async () => {
    const result = await service.deactivate(workspaceId, category.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      category.code,
    );
  });

  it("throws NotFoundException when product category is unknown", async () => {
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
