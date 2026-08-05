import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, StockMovementDirection } from "@prisma/client";
import {
  StockMovementsRepository,
  StockTransferRejectedError,
  StockUpdateRejectedError,
} from "../stock-movements.repository";
import { StockMovementsService } from "../stock-movements.service";

describe("StockMovementsService", () => {
  let repository: jest.Mocked<StockMovementsRepository>;
  let service: StockMovementsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const inventoryItemId = "20000000-0000-4000-8000-000000000001";
  const movement = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    inventoryItemId,
    direction: StockMovementDirection.IN,
    quantity: new Prisma.Decimal(5),
    quantityBefore: new Prisma.Decimal(10),
    quantityAfter: new Prisma.Decimal(15),
    reason: null,
    referenceType: null,
    referenceId: null,
    occurredAt: new Date("2026-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const inventoryItem = {
    id: inventoryItemId,
    workspaceId,
    warehouseId: "40000000-0000-4000-8000-000000000001",
    storageLocationId: "50000000-0000-4000-8000-000000000001",
    productId: "60000000-0000-4000-8000-000000000001",
    productVariantId: null,
    quantityOnHand: new Prisma.Decimal(10),
    quantityReserved: new Prisma.Decimal(0),
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      createMovementAndUpdateStock: jest.fn().mockResolvedValue(movement),
      createTransferAndUpdateStock: jest.fn().mockResolvedValue({
        outMovement: { ...movement, direction: StockMovementDirection.OUT },
        inMovement: movement,
      }),
      findById: jest.fn().mockResolvedValue(movement),
      findByInventoryItem: jest.fn().mockResolvedValue([movement]),
      findByWorkspace: jest.fn().mockResolvedValue([movement]),
      findInventoryItem: jest.fn().mockResolvedValue(inventoryItem),
    } as unknown as jest.Mocked<StockMovementsRepository>;

    service = new StockMovementsService(repository);
  });

  it("creates an inbound movement with a server-side Decimal quantity", async () => {
    const result = await service.create(workspaceId, {
      inventoryItemId,
      direction: StockMovementDirection.IN,
      quantity: 5,
      reason: "Goods receipt",
    });

    expect(result).toEqual(movement);
    expect(repository.findInventoryItem).toHaveBeenCalledWith(
      workspaceId,
      inventoryItemId,
    );
    const createData = repository.createMovementAndUpdateStock.mock.calls[0][0];
    expect(createData.quantity.toString()).toBe("5");
    expect(createData).not.toHaveProperty("quantityBefore");
    expect(createData).not.toHaveProperty("quantityAfter");
  });

  it("accepts an outbound movement that leaves non-negative stock", async () => {
    await service.create(workspaceId, {
      inventoryItemId,
      direction: StockMovementDirection.OUT,
      quantity: 10,
    });

    expect(repository.createMovementAndUpdateStock).toHaveBeenCalledTimes(1);
  });

  it("rejects a non-positive quantity even when called outside HTTP validation", async () => {
    await expect(
      service.create(workspaceId, {
        inventoryItemId,
        direction: StockMovementDirection.IN,
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createMovementAndUpdateStock).not.toHaveBeenCalled();
  });

  it("rejects an outbound movement that would produce negative stock", async () => {
    await expect(
      service.create(workspaceId, {
        inventoryItemId,
        direction: StockMovementDirection.OUT,
        quantity: 10.0001,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createMovementAndUpdateStock).not.toHaveBeenCalled();
  });

  it("rejects movements for an inactive inventory item", async () => {
    repository.findInventoryItem.mockResolvedValueOnce({
      ...inventoryItem,
      isActive: false,
    });

    await expect(
      service.create(workspaceId, {
        inventoryItemId,
        direction: StockMovementDirection.IN,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects an inventory item outside the workspace", async () => {
    repository.findInventoryItem.mockResolvedValueOnce(null);

    await expect(
      service.create(workspaceId, {
        inventoryItemId,
        direction: StockMovementDirection.IN,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("maps a concurrent guarded update rejection to a business error", async () => {
    repository.createMovementAndUpdateStock.mockRejectedValueOnce(
      new StockUpdateRejectedError(),
    );

    await expect(
      service.create(workspaceId, {
        inventoryItemId,
        direction: StockMovementDirection.OUT,
        quantity: 5,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("validates and delegates an atomic transfer", async () => {
    const destinationInventoryItemId =
      "20000000-0000-4000-8000-000000000002";
    repository.findInventoryItem
      .mockResolvedValueOnce(inventoryItem)
      .mockResolvedValueOnce({
        ...inventoryItem,
        id: destinationInventoryItemId,
        quantityOnHand: new Prisma.Decimal(2),
      });

    await service.createTransfer(workspaceId, {
      sourceInventoryItemId: inventoryItemId,
      destinationInventoryItemId,
      quantity: 4,
      referenceId: "70000000-0000-4000-8000-000000000001",
      reason: " Replenishment ",
    });

    const transferData =
      repository.createTransferAndUpdateStock.mock.calls[0][0];
    expect(transferData.quantity.toString()).toBe("4");
    expect(transferData.reason).toBe("Replenishment");
    expect(transferData.sourceInventoryItemId).toBe(inventoryItemId);
    expect(transferData.destinationInventoryItemId).toBe(
      destinationInventoryItemId,
    );
  });

  it("rejects a transfer to the same inventory item", async () => {
    await expect(
      service.createTransfer(workspaceId, {
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId: inventoryItemId,
        quantity: 1,
        referenceId: "70000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.findInventoryItem).not.toHaveBeenCalled();
  });

  it("rejects a transfer with insufficient source stock", async () => {
    repository.findInventoryItem
      .mockResolvedValueOnce(inventoryItem)
      .mockResolvedValueOnce({
        ...inventoryItem,
        id: "20000000-0000-4000-8000-000000000002",
      });

    await expect(
      service.createTransfer(workspaceId, {
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: 11,
        referenceId: "70000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createTransferAndUpdateStock).not.toHaveBeenCalled();
  });

  it("rejects transfer items with different products", async () => {
    repository.findInventoryItem
      .mockResolvedValueOnce(inventoryItem)
      .mockResolvedValueOnce({
        ...inventoryItem,
        id: "20000000-0000-4000-8000-000000000002",
        productId: "60000000-0000-4000-8000-000000000099",
      });

    await expect(
      service.createTransfer(workspaceId, {
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: 1,
        referenceId: "70000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects transfer items with different variants", async () => {
    repository.findInventoryItem
      .mockResolvedValueOnce(inventoryItem)
      .mockResolvedValueOnce({
        ...inventoryItem,
        id: "20000000-0000-4000-8000-000000000002",
        productVariantId: "80000000-0000-4000-8000-000000000001",
      });

    await expect(
      service.createTransfer(workspaceId, {
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: 1,
        referenceId: "70000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects transfers involving an inactive item", async () => {
    repository.findInventoryItem
      .mockResolvedValueOnce(inventoryItem)
      .mockResolvedValueOnce({
        ...inventoryItem,
        id: "20000000-0000-4000-8000-000000000002",
        isActive: false,
      });

    await expect(
      service.createTransfer(workspaceId, {
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: 1,
        referenceId: "70000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("maps a concurrent transfer rejection to a business error", async () => {
    repository.findInventoryItem
      .mockResolvedValueOnce(inventoryItem)
      .mockResolvedValueOnce({
        ...inventoryItem,
        id: "20000000-0000-4000-8000-000000000002",
      });
    repository.createTransferAndUpdateStock.mockRejectedValueOnce(
      new StockTransferRejectedError(),
    );

    await expect(
      service.createTransfer(workspaceId, {
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: 1,
        referenceId: "70000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("gets a movement within its workspace", async () => {
    const result = await service.get(workspaceId, movement.id);

    expect(result).toEqual(movement);
    expect(repository.findById).toHaveBeenCalledWith(workspaceId, movement.id);
  });

  it("throws when a movement is outside the workspace", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, movement.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("lists movements for a workspace-scoped inventory item", async () => {
    const result = await service.listByInventoryItem(
      workspaceId,
      inventoryItemId,
    );

    expect(result).toEqual([movement]);
    expect(repository.findInventoryItem).toHaveBeenCalledWith(
      workspaceId,
      inventoryItemId,
    );
    expect(repository.findByInventoryItem).toHaveBeenCalledWith(
      workspaceId,
      inventoryItemId,
    );
  });

  it("lists all workspace movements", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([movement]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });
});
