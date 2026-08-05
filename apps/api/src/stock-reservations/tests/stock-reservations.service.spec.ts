import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  StockMovementDirection,
  StockReservationStatus,
} from "@prisma/client";
import {
  StockReservationOperationRejectedError,
  StockReservationsRepository,
} from "../stock-reservations.repository";
import { StockReservationsService } from "../stock-reservations.service";

describe("StockReservationsService", () => {
  let repository: jest.Mocked<StockReservationsRepository>;
  let service: StockReservationsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const inventoryItemId = "20000000-0000-4000-8000-000000000001";
  const reservationId = "30000000-0000-4000-8000-000000000001";
  const inventoryItem = {
    id: inventoryItemId,
    workspaceId,
    warehouseId: "40000000-0000-4000-8000-000000000001",
    storageLocationId: "50000000-0000-4000-8000-000000000001",
    productId: "60000000-0000-4000-8000-000000000001",
    productVariantId: null,
    quantityOnHand: new Prisma.Decimal(10),
    quantityReserved: new Prisma.Decimal(3),
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const reservation = {
    id: reservationId,
    workspaceId,
    inventoryItemId,
    quantity: new Prisma.Decimal(4),
    status: StockReservationStatus.ACTIVE,
    referenceType: "SALES_ORDER",
    referenceId: "SO-001",
    expiresAt: null,
    releasedAt: null,
    consumedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      createAndReserve: jest.fn().mockResolvedValue(reservation),
      release: jest.fn().mockResolvedValue(reservation),
      consume: jest.fn().mockResolvedValue({
        reservation: { ...reservation, status: StockReservationStatus.CONSUMED },
        movement: {
          id: "70000000-0000-4000-8000-000000000001",
          workspaceId,
          inventoryItemId,
          direction: StockMovementDirection.OUT,
          quantity: reservation.quantity,
          quantityBefore: new Prisma.Decimal(10),
          quantityAfter: new Prisma.Decimal(6),
          reason: null,
          referenceType: "STOCK_RESERVATION",
          referenceId: reservationId,
          occurredAt: new Date("2026-01-02T00:00:00.000Z"),
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      }),
      findById: jest.fn().mockResolvedValue(reservation),
      findByInventoryItem: jest.fn().mockResolvedValue([reservation]),
      findByWorkspace: jest.fn().mockResolvedValue([reservation]),
      findInventoryItem: jest.fn().mockResolvedValue(inventoryItem),
    } as unknown as jest.Mocked<StockReservationsRepository>;

    service = new StockReservationsService(repository);
  });

  it("creates a reservation from available stock", async () => {
    await service.create(workspaceId, {
      inventoryItemId,
      quantity: 7,
      referenceType: "SALES_ORDER",
      referenceId: "SO-001",
    });

    const createData = repository.createAndReserve.mock.calls[0][0];
    expect(createData.quantity.toString()).toBe("7");
    expect(createData.workspaceId).toBe(workspaceId);
  });

  it("rejects over-reservation", async () => {
    await expect(
      service.create(workspaceId, { inventoryItemId, quantity: 8 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createAndReserve).not.toHaveBeenCalled();
  });

  it("rejects reservations on an inactive inventory item", async () => {
    repository.findInventoryItem.mockResolvedValueOnce({
      ...inventoryItem,
      isActive: false,
    });

    await expect(
      service.create(workspaceId, { inventoryItemId, quantity: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("releases only an active reservation", async () => {
    await service.release(workspaceId, reservationId);

    expect(repository.release).toHaveBeenCalledWith(
      workspaceId,
      reservationId,
      StockReservationStatus.RELEASED,
    );
  });

  it("cancels only an active reservation", async () => {
    await service.cancel(workspaceId, reservationId);

    expect(repository.release).toHaveBeenCalledWith(
      workspaceId,
      reservationId,
      StockReservationStatus.CANCELLED,
    );
  });

  it("consumes an active reservation atomically", async () => {
    const result = await service.consume(workspaceId, reservationId);

    expect(result.reservation.status).toBe(StockReservationStatus.CONSUMED);
    expect(result.movement.direction).toBe(StockMovementDirection.OUT);
    expect(repository.consume).toHaveBeenCalledWith(workspaceId, reservationId);
  });

  it("rejects changes to a non-active reservation", async () => {
    repository.findById.mockResolvedValueOnce({
      ...reservation,
      status: StockReservationStatus.RELEASED,
    });

    await expect(
      service.consume(workspaceId, reservationId),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.consume).not.toHaveBeenCalled();
  });

  it("maps concurrent transactional rejection to a business error", async () => {
    repository.createAndReserve.mockRejectedValueOnce(
      new StockReservationOperationRejectedError(),
    );

    await expect(
      service.create(workspaceId, { inventoryItemId, quantity: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("preserves workspace isolation", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, reservationId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("lists reservations by a workspace-scoped inventory item", async () => {
    const result = await service.listByInventoryItem(
      workspaceId,
      inventoryItemId,
    );

    expect(result).toEqual([reservation]);
    expect(repository.findInventoryItem).toHaveBeenCalledWith(
      workspaceId,
      inventoryItemId,
    );
  });
});
