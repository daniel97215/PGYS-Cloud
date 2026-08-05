import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, StockMovementDirection } from "@prisma/client";
import { StockMovementsService } from "../../stock-movements/stock-movements.service";
import { InventoryAdjustmentsService } from "../inventory-adjustments.service";

describe("InventoryAdjustmentsService", () => {
  let stockMovementsService: jest.Mocked<StockMovementsService>;
  let service: InventoryAdjustmentsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const inventoryItemId = "20000000-0000-4000-8000-000000000001";
  const currentMovement = createMovement({
    id: "30000000-0000-4000-8000-000000000001",
    direction: StockMovementDirection.IN,
    quantity: 10,
    quantityBefore: 0,
    quantityAfter: 10,
  });

  beforeEach(() => {
    stockMovementsService = {
      listByInventoryItem: jest.fn().mockResolvedValue([currentMovement]),
      create: jest.fn(),
    } as unknown as jest.Mocked<StockMovementsService>;

    service = new InventoryAdjustmentsService(stockMovementsService);
  });

  it("creates an IN movement for an upward adjustment", async () => {
    const createdMovement = createMovement({
      id: "30000000-0000-4000-8000-000000000002",
      direction: StockMovementDirection.IN,
      quantity: 5,
      quantityBefore: 10,
      quantityAfter: 15,
    });
    stockMovementsService.create.mockResolvedValueOnce(createdMovement);

    const result = await service.create({
      workspaceId,
      inventoryItemId,
      countedQuantity: 15,
      reason: "Physical count correction",
    });

    expect(stockMovementsService.create).toHaveBeenCalledWith(workspaceId, {
      inventoryItemId,
      direction: StockMovementDirection.IN,
      quantity: 5,
      reason: "Physical count correction",
      referenceType: "INVENTORY_ADJUSTMENT",
    });
    expect(result.movement).toEqual(createdMovement);
    expect(result.quantityOnHand.toString()).toBe("15");
  });

  it("creates an OUT movement for a downward adjustment", async () => {
    const createdMovement = createMovement({
      id: "30000000-0000-4000-8000-000000000002",
      direction: StockMovementDirection.OUT,
      quantity: 6,
      quantityBefore: 10,
      quantityAfter: 4,
    });
    stockMovementsService.create.mockResolvedValueOnce(createdMovement);

    const result = await service.create({
      workspaceId,
      inventoryItemId,
      countedQuantity: 4,
      reason: "Damaged units removed",
    });

    expect(stockMovementsService.create).toHaveBeenCalledWith(workspaceId, {
      inventoryItemId,
      direction: StockMovementDirection.OUT,
      quantity: 6,
      reason: "Damaged units removed",
      referenceType: "INVENTORY_ADJUSTMENT",
    });
    expect(result.quantityOnHand.toString()).toBe("4");
  });

  it("uses zero as current stock when no movement exists", async () => {
    stockMovementsService.listByInventoryItem.mockResolvedValueOnce([]);
    const createdMovement = createMovement({
      id: "30000000-0000-4000-8000-000000000002",
      direction: StockMovementDirection.IN,
      quantity: 3,
      quantityBefore: 0,
      quantityAfter: 3,
    });
    stockMovementsService.create.mockResolvedValueOnce(createdMovement);

    await service.create({
      workspaceId,
      inventoryItemId,
      countedQuantity: 3,
      reason: "Initial physical count",
    });

    expect(stockMovementsService.create).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        direction: StockMovementDirection.IN,
        quantity: 3,
      }),
    );
  });

  it("rejects an adjustment without a quantity difference", async () => {
    await expect(
      service.create({
        workspaceId,
        inventoryItemId,
        countedQuantity: 10,
        reason: "Verification count",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(stockMovementsService.create).not.toHaveBeenCalled();
  });

  it("rejects a negative counted quantity", async () => {
    await expect(
      service.create({
        workspaceId,
        inventoryItemId,
        countedQuantity: -1,
        reason: "Invalid count",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(stockMovementsService.listByInventoryItem).not.toHaveBeenCalled();
  });

  it("rejects an empty reason", async () => {
    await expect(
      service.create({
        workspaceId,
        inventoryItemId,
        countedQuantity: 12,
        reason: "   ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(stockMovementsService.listByInventoryItem).not.toHaveBeenCalled();
  });

  it("preserves workspace isolation from StockMovementsService", async () => {
    stockMovementsService.listByInventoryItem.mockRejectedValueOnce(
      new NotFoundException("Inventory item not found"),
    );

    await expect(
      service.create({
        workspaceId,
        inventoryItemId,
        countedQuantity: 12,
        reason: "Physical count correction",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("preserves inactive-item rejection from StockMovementsService", async () => {
    stockMovementsService.create.mockRejectedValueOnce(
      new BadRequestException("Inventory item is inactive"),
    );

    await expect(
      service.create({
        workspaceId,
        inventoryItemId,
        countedQuantity: 12,
        reason: "Physical count correction",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  function createMovement(data: {
    id: string;
    direction: StockMovementDirection;
    quantity: number;
    quantityBefore: number;
    quantityAfter: number;
  }) {
    return {
      id: data.id,
      workspaceId,
      inventoryItemId,
      direction: data.direction,
      quantity: new Prisma.Decimal(data.quantity),
      quantityBefore: new Prisma.Decimal(data.quantityBefore),
      quantityAfter: new Prisma.Decimal(data.quantityAfter),
      reason: "Physical count correction",
      referenceType: "INVENTORY_ADJUSTMENT",
      referenceId: null,
      occurredAt: new Date("2026-01-01T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  }
});
