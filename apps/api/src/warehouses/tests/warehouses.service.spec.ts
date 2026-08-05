import { BadRequestException, NotFoundException } from "@nestjs/common";
import { WarehousesRepository } from "../warehouses.repository";
import { WarehousesService } from "../warehouses.service";

describe("WarehousesService", () => {
  let repository: jest.Mocked<WarehousesRepository>;
  let service: WarehousesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouse = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "MAIN",
    name: "Main warehouse",
    description: "Primary storage warehouse",
    address: { city: "Paris" },
    isDefault: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(warehouse),
      update: jest.fn().mockResolvedValue(warehouse),
      deactivate: jest.fn().mockResolvedValue({ ...warehouse, isActive: false }),
      findByWorkspace: jest.fn().mockResolvedValue([warehouse]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(warehouse),
    } as unknown as jest.Mocked<WarehousesRepository>;

    service = new WarehousesService(repository);
  });

  it("creates a warehouse with an uppercase code", async () => {
    const result = await service.create(workspaceId, {
      code: "main",
      name: warehouse.name,
      description: warehouse.description,
      address: warehouse.address,
      isDefault: warehouse.isDefault,
    });

    expect(result).toEqual(warehouse);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: warehouse.code,
      name: warehouse.name,
      description: warehouse.description,
      address: warehouse.address,
      isDefault: warehouse.isDefault,
    });
  });

  it("updates a warehouse within its workspace", async () => {
    const result = await service.update(workspaceId, "main", {
      name: "Updated warehouse",
      address: { city: "Lyon" },
    });

    expect(result).toEqual(warehouse);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      warehouse.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, warehouse.code, {
      name: "Updated warehouse",
      address: { city: "Lyon" },
    });
  });

  it("lists warehouses for the workspace", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([warehouse]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a warehouse by normalized code", async () => {
    const result = await service.getByCode(workspaceId, "main");

    expect(result).toEqual(warehouse);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      warehouse.code,
    );
  });

  it("deactivates a warehouse without deleting it", async () => {
    const result = await service.deactivate(workspaceId, "main");

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      warehouse.code,
    );
  });

  it("throws NotFoundException when the warehouse is unknown", async () => {
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
