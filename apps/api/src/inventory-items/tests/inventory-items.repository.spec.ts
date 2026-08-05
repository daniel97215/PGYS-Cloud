import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { InventoryItemsRepository } from "../inventory-items.repository";

describe("InventoryItemsRepository", () => {
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

  it("creates an inventory item without quantity input", async () => {
    const create = jest.fn().mockResolvedValue(inventoryItem);
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryCreate: create }),
    );

    await repository.create({
      workspaceId,
      warehouseId,
      storageLocationId,
      productId,
    });

    expect(create).toHaveBeenCalledWith({
      data: { workspaceId, warehouseId, storageLocationId, productId },
    });
  });

  it("updates an inventory item within its workspace", async () => {
    const update = jest.fn().mockResolvedValue(inventoryItem);
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryUpdate: update }),
    );

    await repository.update(workspaceId, inventoryItem.id, { isActive: true });

    expect(update).toHaveBeenCalledWith({
      where: { id: inventoryItem.id, workspaceId },
      data: { isActive: true },
    });
  });

  it("deactivates an inventory item within its workspace", async () => {
    const update = jest
      .fn()
      .mockResolvedValue({ ...inventoryItem, isActive: false });
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryUpdate: update }),
    );

    const result = await repository.deactivate(workspaceId, inventoryItem.id);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: { id: inventoryItem.id, workspaceId },
      data: { isActive: false },
    });
  });

  it("finds an inventory item by workspace and id", async () => {
    const findFirst = jest.fn().mockResolvedValue(inventoryItem);
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryFindFirst: findFirst }),
    );

    await repository.findById(workspaceId, inventoryItem.id);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: inventoryItem.id, workspaceId },
    });
  });

  it("lists inventory items by location and workspace", async () => {
    const findMany = jest.fn().mockResolvedValue([inventoryItem]);
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryFindMany: findMany }),
    );

    await repository.findByLocation(workspaceId, storageLocationId);

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, storageLocationId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  });

  it("lists inventory items by product and workspace", async () => {
    const findMany = jest.fn().mockResolvedValue([inventoryItem]);
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryFindMany: findMany }),
    );

    await repository.findByProduct(workspaceId, productId);

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, productId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  });

  it("detects duplicate items when productVariantId is null", async () => {
    const findFirst = jest.fn().mockResolvedValue(inventoryItem);
    const repository = new InventoryItemsRepository(
      createPrismaMock({ inventoryFindFirst: findFirst }),
    );

    await repository.findDuplicate(
      workspaceId,
      storageLocationId,
      productId,
      null,
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId,
        storageLocationId,
        productId,
        productVariantId: null,
      },
    });
  });

  it("loads a workspace-scoped storage location with its warehouse", async () => {
    const findFirst = jest
      .fn()
      .mockResolvedValue({ id: storageLocationId, warehouseId });
    const repository = new InventoryItemsRepository(
      createPrismaMock({ storageLocationFindFirst: findFirst }),
    );

    await repository.findStorageLocation(workspaceId, storageLocationId);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: storageLocationId, workspaceId },
      select: { id: true, warehouseId: true },
    });
  });

  it("checks product variant ownership by workspace and product", async () => {
    const productVariantId = "60000000-0000-4000-8000-000000000001";
    const findFirst = jest.fn().mockResolvedValue({ id: productVariantId });
    const repository = new InventoryItemsRepository(
      createPrismaMock({ productVariantFindFirst: findFirst }),
    );

    const result = await repository.productVariantBelongsToProduct(
      workspaceId,
      productId,
      productVariantId,
    );

    expect(result).toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: productVariantId, workspaceId, productId },
      select: { id: true },
    });
  });
});

function createPrismaMock(methods: {
  inventoryCreate?: jest.Mock;
  inventoryUpdate?: jest.Mock;
  inventoryFindFirst?: jest.Mock;
  inventoryFindMany?: jest.Mock;
  warehouseFindFirst?: jest.Mock;
  storageLocationFindFirst?: jest.Mock;
  productFindFirst?: jest.Mock;
  productVariantFindFirst?: jest.Mock;
}): PrismaService {
  return {
    inventoryItem: {
      create: methods.inventoryCreate ?? jest.fn(),
      update: methods.inventoryUpdate ?? jest.fn(),
      findFirst: methods.inventoryFindFirst ?? jest.fn(),
      findMany: methods.inventoryFindMany ?? jest.fn(),
    },
    warehouse: { findFirst: methods.warehouseFindFirst ?? jest.fn() },
    storageLocation: {
      findFirst: methods.storageLocationFindFirst ?? jest.fn(),
    },
    product: { findFirst: methods.productFindFirst ?? jest.fn() },
    productVariant: {
      findFirst: methods.productVariantFindFirst ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
