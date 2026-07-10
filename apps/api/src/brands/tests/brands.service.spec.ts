import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BrandsRepository } from "../brands.repository";
import { BrandsService } from "../brands.service";

describe("BrandsService", () => {
  let repository: jest.Mocked<BrandsRepository>;
  let service: BrandsService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(brand),
      update: jest.fn().mockResolvedValue(brand),
      deactivate: jest.fn().mockResolvedValue({
        ...brand,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([brand]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(brand),
    } as unknown as jest.Mocked<BrandsRepository>;

    service = new BrandsService(repository);
  });

  it("creates a brand", async () => {
    const result = await service.create(workspaceId, {
      code: "acme",
      name: brand.name,
      description: brand.description,
      websiteUrl: brand.websiteUrl,
    });

    expect(result).toEqual(brand);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: brand.code,
      name: brand.name,
      description: brand.description,
      websiteUrl: brand.websiteUrl,
    });
  });

  it("updates a brand", async () => {
    const result = await service.update(workspaceId, brand.code, {
      name: "Acme Pro",
    });

    expect(result).toEqual(brand);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      brand.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, brand.code, {
      name: "Acme Pro",
    });
  });

  it("lists brands", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([brand]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a brand by code", async () => {
    const result = await service.getByCode(workspaceId, brand.code);

    expect(result).toEqual(brand);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      brand.code,
    );
  });

  it("deactivates a brand", async () => {
    const result = await service.deactivate(workspaceId, brand.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      brand.code,
    );
  });

  it("throws NotFoundException when brand is unknown", async () => {
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
