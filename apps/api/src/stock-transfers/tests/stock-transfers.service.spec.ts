import { Prisma, StockMovementDirection } from "@prisma/client";
import { StockMovementsService } from "../../stock-movements/stock-movements.service";
import { StockTransfersService } from "../stock-transfers.service";

describe("StockTransfersService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const sourceInventoryItemId = "20000000-0000-4000-8000-000000000001";
  const destinationInventoryItemId =
    "20000000-0000-4000-8000-000000000002";
  let stockMovementsService: jest.Mocked<StockMovementsService>;
  let service: StockTransfersService;

  beforeEach(() => {
    stockMovementsService = {
      createTransfer: jest.fn(),
    } as unknown as jest.Mocked<StockMovementsService>;
    service = new StockTransfersService(stockMovementsService);
  });

  it("generates one reference and returns the two linked movements", async () => {
    const outMovement = createMovement(
      "30000000-0000-4000-8000-000000000001",
      sourceInventoryItemId,
      StockMovementDirection.OUT,
      10,
      6,
    );
    const inMovement = createMovement(
      "30000000-0000-4000-8000-000000000002",
      destinationInventoryItemId,
      StockMovementDirection.IN,
      2,
      6,
    );
    stockMovementsService.createTransfer.mockResolvedValueOnce({
      outMovement,
      inMovement,
    });

    const result = await service.create({
      workspaceId,
      sourceInventoryItemId,
      destinationInventoryItemId,
      quantity: 4,
      reason: " Replenishment ",
    });

    expect(result.referenceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(result).toEqual({
      referenceId: result.referenceId,
      outMovement,
      inMovement,
    });
    expect(stockMovementsService.createTransfer).toHaveBeenCalledWith(
      workspaceId,
      {
        sourceInventoryItemId,
        destinationInventoryItemId,
        quantity: 4,
        referenceId: result.referenceId,
        reason: "Replenishment",
      },
    );
  });

  it("delegates an optional-reason transfer without adding a reason", async () => {
    const outMovement = createMovement(
      "30000000-0000-4000-8000-000000000001",
      sourceInventoryItemId,
      StockMovementDirection.OUT,
      10,
      9,
    );
    const inMovement = createMovement(
      "30000000-0000-4000-8000-000000000002",
      destinationInventoryItemId,
      StockMovementDirection.IN,
      2,
      3,
    );
    stockMovementsService.createTransfer.mockResolvedValueOnce({
      outMovement,
      inMovement,
    });

    await service.create({
      workspaceId,
      sourceInventoryItemId,
      destinationInventoryItemId,
      quantity: 1,
    });

    expect(stockMovementsService.createTransfer).toHaveBeenCalledWith(
      workspaceId,
      expect.not.objectContaining({ reason: expect.anything() }),
    );
  });

  function createMovement(
    id: string,
    inventoryItemId: string,
    direction: StockMovementDirection,
    quantityBefore: number,
    quantityAfter: number,
  ) {
    return {
      id,
      workspaceId,
      inventoryItemId,
      direction,
      quantity: new Prisma.Decimal(4),
      quantityBefore: new Prisma.Decimal(quantityBefore),
      quantityAfter: new Prisma.Decimal(quantityAfter),
      reason: "Replenishment",
      referenceType: "STOCK_TRANSFER",
      referenceId: "40000000-0000-4000-8000-000000000001",
      occurredAt: new Date("2026-01-01T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  }
});
