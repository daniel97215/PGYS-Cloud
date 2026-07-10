import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BusinessPartnerCategoriesRepository } from "../business-partner-categories.repository";
import { BusinessPartnerCategoriesService } from "../business-partner-categories.service";

describe("BusinessPartnerCategoriesService", () => {
  let repository: jest.Mocked<BusinessPartnerCategoriesRepository>;
  let service: BusinessPartnerCategoriesService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(category),
      update: jest.fn().mockResolvedValue(category),
      disable: jest.fn().mockResolvedValue({
        ...category,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([category]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(category),
    } as unknown as jest.Mocked<BusinessPartnerCategoriesRepository>;

    service = new BusinessPartnerCategoriesService(repository);
  });

  it("creates a customer category", async () => {
    const result = await service.createCategory(workspaceId, {
      code: "grand-compte",
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

  it("lists workspace customer categories", async () => {
    const result = await service.listWorkspaceCategories(workspaceId);

    expect(result).toEqual([category]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a customer category by code", async () => {
    const result = await service.getCategory(workspaceId, "grand-compte");

    expect(result).toEqual(category);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      category.code,
    );
  });

  it("updates a customer category", async () => {
    const result = await service.updateCategory(workspaceId, category.code, {
      name: "Collectivite",
    });

    expect(result).toEqual(category);
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      category.code,
      {
        name: "Collectivite",
      },
    );
  });

  it("disables a customer category", async () => {
    const result = await service.disableCategory(workspaceId, category.code);

    expect(result.isActive).toBe(false);
    expect(repository.disable).toHaveBeenCalledWith(workspaceId, category.code);
  });

  it("throws NotFoundException when category is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

    await expect(
      service.getCategory(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getCategory(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
