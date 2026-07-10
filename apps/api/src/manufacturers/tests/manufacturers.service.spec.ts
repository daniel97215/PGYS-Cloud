import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ManufacturersRepository } from "../manufacturers.repository";
import { ManufacturersService } from "../manufacturers.service";

describe("ManufacturersService", () => {
  let repository: jest.Mocked<ManufacturersRepository>;
  let service: ManufacturersService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const manufacturer = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "ACME-MFG",
    name: "Acme Manufacturing",
    description: "Acme product manufacturer",
    websiteUrl: "https://example.com",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(manufacturer),
      update: jest.fn().mockResolvedValue(manufacturer),
      deactivate: jest.fn().mockResolvedValue({
        ...manufacturer,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([manufacturer]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(manufacturer),
    } as unknown as jest.Mocked<ManufacturersRepository>;

    service = new ManufacturersService(repository);
  });

  it("creates a manufacturer", async () => {
    const result = await service.create(workspaceId, {
      code: "acme-mfg",
      name: manufacturer.name,
      description: manufacturer.description,
      websiteUrl: manufacturer.websiteUrl,
    });

    expect(result).toEqual(manufacturer);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: manufacturer.code,
      name: manufacturer.name,
      description: manufacturer.description,
      websiteUrl: manufacturer.websiteUrl,
    });
  });

  it("updates a manufacturer", async () => {
    const result = await service.update(workspaceId, manufacturer.code, {
      name: "Acme Manufacturing Pro",
    });

    expect(result).toEqual(manufacturer);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      manufacturer.code,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      manufacturer.code,
      { name: "Acme Manufacturing Pro" },
    );
  });

  it("lists manufacturers", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([manufacturer]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a manufacturer by code", async () => {
    const result = await service.getByCode(workspaceId, manufacturer.code);

    expect(result).toEqual(manufacturer);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      manufacturer.code,
    );
  });

  it("deactivates a manufacturer", async () => {
    const result = await service.deactivate(workspaceId, manufacturer.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      manufacturer.code,
    );
  });

  it("throws NotFoundException when manufacturer is unknown", async () => {
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
