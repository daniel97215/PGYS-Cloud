import { BadRequestException, NotFoundException } from "@nestjs/common";
import { StorageLocationsRepository } from "../storage-locations.repository";
import { StorageLocationsService } from "../storage-locations.service";

describe("StorageLocationsService", () => {
  let repository: jest.Mocked<StorageLocationsRepository>;
  let service: StorageLocationsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "20000000-0000-4000-8000-000000000001";
  const storageLocation = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    warehouseId,
    code: "ZONE-A",
    name: "Zone A",
    description: "Ground-floor storage zone",
    locationType: "ZONE",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(storageLocation),
      update: jest.fn().mockResolvedValue(storageLocation),
      deactivate: jest
        .fn()
        .mockResolvedValue({ ...storageLocation, isActive: false }),
      findByWarehouse: jest.fn().mockResolvedValue([storageLocation]),
      findByWarehouseAndCode: jest.fn().mockResolvedValue(storageLocation),
      warehouseBelongsToWorkspace: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<StorageLocationsRepository>;

    service = new StorageLocationsService(repository);
  });

  it("creates a storage location with an uppercase code", async () => {
    const result = await service.create(workspaceId, warehouseId, {
      code: "zone-a",
      name: storageLocation.name,
      description: storageLocation.description,
      locationType: storageLocation.locationType,
    });

    expect(result).toEqual(storageLocation);
    expect(repository.warehouseBelongsToWorkspace).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
    );
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      warehouseId,
      code: storageLocation.code,
      name: storageLocation.name,
      description: storageLocation.description,
      locationType: storageLocation.locationType,
    });
  });

  it("updates a storage location within its workspace and warehouse", async () => {
    const result = await service.update(
      workspaceId,
      warehouseId,
      "zone-a",
      { name: "Updated zone" },
    );

    expect(result).toEqual(storageLocation);
    expect(repository.findByWarehouseAndCode).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
      storageLocation.code,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
      storageLocation.code,
      { name: "Updated zone" },
    );
  });

  it("lists storage locations for the workspace warehouse", async () => {
    const result = await service.listByWarehouse(workspaceId, warehouseId);

    expect(result).toEqual([storageLocation]);
    expect(repository.warehouseBelongsToWorkspace).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
    );
    expect(repository.findByWarehouse).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
    );
  });

  it("gets a storage location by normalized code", async () => {
    const result = await service.getByCode(
      workspaceId,
      warehouseId,
      "zone-a",
    );

    expect(result).toEqual(storageLocation);
    expect(repository.findByWarehouseAndCode).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
      storageLocation.code,
    );
  });

  it("deactivates a storage location without deleting it", async () => {
    const result = await service.deactivate(
      workspaceId,
      warehouseId,
      "zone-a",
    );

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      warehouseId,
      storageLocation.code,
    );
  });

  it("rejects a warehouse from another workspace", async () => {
    repository.warehouseBelongsToWorkspace.mockResolvedValueOnce(false);

    await expect(
      service.listByWarehouse(workspaceId, warehouseId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findByWarehouse).not.toHaveBeenCalled();
  });

  it("throws NotFoundException when the storage location is unknown", async () => {
    repository.findByWarehouseAndCode.mockResolvedValueOnce(null);

    await expect(
      service.getByCode(workspaceId, warehouseId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(
      service.getByCode(workspaceId, warehouseId, " "),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
