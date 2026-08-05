import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { InventoryItemsRepository } from "../inventory-items.repository";
import { InventoryItemsService } from "../inventory-items.service";

describe("InventoryItemsService", () => {
  let repository: jest.Mocked<InventoryItemsRepository>;
  let service: InventoryItemsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "20000000-0000-4000-8000-000000000001";
  const storageLocationId = "30000000-0000-4000-8000-000000000001";
  const productId = "40000000-0000-4000-8000-000000000001";
  const inventoryItem = {
    id: "50000000-0000-4000-8000-000000000001",
    workspaceId,
    warehouseId,
    storageLocationId,
    productId,
    productVariantId: null,
    quantityOnHand: new Prisma.Decimal(0),
    quantityReserved: new Prisma.Decimal(0),
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(inventoryItem),
      update: jest.fn().mockResolvedValue(inventoryItem),
      deactivate: jest
        .fn()
        .mockResolvedValue({ ...inventoryItem, isActive: false }),
      findById: jest.fn().mockResolvedValue(inventoryItem),
      findByLocation: jest.fn().mockResolvedValue([inventoryItem]),
      findByProduct: jest.fn().mockResolvedValue([inventoryItem]),
      findDuplicate: jest.fn().mockResolvedValue(null),
      warehouseBelongsToWorkspace: jest.fn().mockResolvedValue(true),
      findStorageLocation: jest
        .fn()
        .mockResolvedValue({ id: storageLocationId, warehouseId }),
      productBelongsToWorkspace: jest.fn().mockResolvedValue(true),
      productVariantBelongsToProduct: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<InventoryItemsRepository>;

    service = new InventoryItemsService(repository);
  });

  it("creates an inventory item with database-default zero quantities", async () => {
    const result = await service.create(workspaceId, {
      warehouseId,
      storageLocationId,
      productId,
    });

    expect(result).toEqual(inventoryItem);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      warehouseId,
      storageLocationId,
      productId,
    });
    expect(repository.findDuplicate).toHaveBeenCalledWith(
      workspaceId,
      storageLocationId,
      productId,
      null,
    );
  });

  it("validates that a variant belongs to the selected product", async () => {
    const productVariantId = "60000000-0000-4000-8000-000000000001";

    await service.create(workspaceId, {
      warehouseId,
      storageLocationId,
      productId,
      productVariantId,
    });

    expect(repository.productVariantBelongsToProduct).toHaveBeenCalledWith(
      workspaceId,
      productId,
      productVariantId,
    );
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      warehouseId,
      storageLocationId,
      productId,
      productVariantId,
    });
  });

  it("rejects a storage location from another warehouse", async () => {
    repository.findStorageLocation.mockResolvedValueOnce({
      id: storageLocationId,
      warehouseId: "20000000-0000-4000-8000-000000000099",
    });

    await expect(
      service.create(workspaceId, {
        warehouseId,
        storageLocationId,
        productId,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects a variant from another product or workspace", async () => {
    repository.productVariantBelongsToProduct.mockResolvedValueOnce(false);

    await expect(
      service.create(workspaceId, {
        warehouseId,
        storageLocationId,
        productId,
        productVariantId: "60000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("prevents duplicates when productVariantId is null", async () => {
    repository.findDuplicate.mockResolvedValueOnce(inventoryItem);

    await expect(
      service.create(workspaceId, {
        warehouseId,
        storageLocationId,
        productId,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("updates only the mutable active state", async () => {
    const result = await service.update(workspaceId, inventoryItem.id, {
      isActive: true,
    });

    expect(result).toEqual(inventoryItem);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      inventoryItem.id,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      inventoryItem.id,
      { isActive: true },
    );
  });

  it("deactivates an inventory item without changing quantities", async () => {
    const result = await service.deactivate(workspaceId, inventoryItem.id);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      inventoryItem.id,
    );
  });

  it("gets an inventory item within its workspace", async () => {
    const result = await service.get(workspaceId, inventoryItem.id);

    expect(result).toEqual(inventoryItem);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      inventoryItem.id,
    );
  });

  it("lists inventory items by a workspace-scoped location", async () => {
    const result = await service.listByLocation(
      workspaceId,
      storageLocationId,
    );

    expect(result).toEqual([inventoryItem]);
    expect(repository.findStorageLocation).toHaveBeenCalledWith(
      workspaceId,
      storageLocationId,
    );
    expect(repository.findByLocation).toHaveBeenCalledWith(
      workspaceId,
      storageLocationId,
    );
  });

  it("lists inventory items by a workspace-scoped product", async () => {
    const result = await service.listByProduct(workspaceId, productId);

    expect(result).toEqual([inventoryItem]);
    expect(repository.productBelongsToWorkspace).toHaveBeenCalledWith(
      workspaceId,
      productId,
    );
    expect(repository.findByProduct).toHaveBeenCalledWith(
      workspaceId,
      productId,
    );
  });

  it("throws when an inventory item belongs to another workspace", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.get(workspaceId, inventoryItem.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
