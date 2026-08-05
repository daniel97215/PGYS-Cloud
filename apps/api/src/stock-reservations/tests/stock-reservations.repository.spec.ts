import {
  Prisma,
  StockMovementDirection,
  StockReservationStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  StockReservationOperationRejectedError,
  StockReservationsRepository,
} from "../stock-reservations.repository";

describe("StockReservationsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const inventoryItemId = "20000000-0000-4000-8000-000000000001";
  const reservationId = "30000000-0000-4000-8000-000000000001";

  it("atomically creates a reservation and increments reserved stock", async () => {
    const updateItem = jest.fn().mockResolvedValue([{
      quantityOnHand: new Prisma.Decimal(10),
      quantityReserved: new Prisma.Decimal(4),
    }]);
    const reservation = createReservation(StockReservationStatus.ACTIVE);
    const create = jest.fn().mockResolvedValue(reservation);
    const transaction = createTransactionMock({
      inventoryItem: { updateManyAndReturn: updateItem },
      stockReservation: { create },
    });
    const repository = new StockReservationsRepository(
      createPrismaMock(transaction),
    );

    const result = await repository.createAndReserve({
      workspaceId,
      inventoryItemId,
      quantity: new Prisma.Decimal(4),
      referenceType: "SALES_ORDER",
      referenceId: "SO-001",
    });

    expect(result).toEqual(reservation);
    expect(updateItem).toHaveBeenCalledWith({
      where: { id: inventoryItemId, workspaceId, isActive: true },
      data: { quantityReserved: { increment: new Prisma.Decimal(4) } },
      select: { quantityOnHand: true, quantityReserved: true },
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rolls back over-reservation before creating a reservation", async () => {
    const updateItem = jest.fn().mockResolvedValue([{
      quantityOnHand: new Prisma.Decimal(10),
      quantityReserved: new Prisma.Decimal(11),
    }]);
    const create = jest.fn();
    const repository = new StockReservationsRepository(
      createPrismaMock(
        createTransactionMock({
          inventoryItem: { updateManyAndReturn: updateItem },
          stockReservation: { create },
        }),
      ),
    );

    await expect(
      repository.createAndReserve({
        workspaceId,
        inventoryItemId,
        quantity: new Prisma.Decimal(4),
      }),
    ).rejects.toBeInstanceOf(StockReservationOperationRejectedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("atomically releases an active reservation without a stock movement", async () => {
    const reservation = createReservation(StockReservationStatus.RELEASED);
    const updateReservation = jest.fn().mockResolvedValue([reservation]);
    const updateItem = jest.fn().mockResolvedValue([{ id: inventoryItemId }]);
    const createMovement = jest.fn();
    const repository = new StockReservationsRepository(
      createPrismaMock(
        createTransactionMock({
          inventoryItem: { updateManyAndReturn: updateItem },
          stockReservation: { updateManyAndReturn: updateReservation },
          stockMovement: { create: createMovement },
        }),
      ),
    );

    const result = await repository.release(
      workspaceId,
      reservationId,
      StockReservationStatus.RELEASED,
    );

    expect(result.status).toBe(StockReservationStatus.RELEASED);
    expect(updateItem).toHaveBeenCalledWith({
      where: {
        id: inventoryItemId,
        workspaceId,
        quantityReserved: { gte: reservation.quantity },
      },
      data: { quantityReserved: { decrement: reservation.quantity } },
      select: { id: true },
    });
    expect(createMovement).not.toHaveBeenCalled();
  });

  it("atomically consumes a reservation and creates one OUT movement", async () => {
    const reservation = createReservation(StockReservationStatus.CONSUMED);
    const updateReservation = jest.fn().mockResolvedValue([reservation]);
    const updateItem = jest
      .fn()
      .mockResolvedValue([{ quantityOnHand: new Prisma.Decimal(6) }]);
    const movement = {
      id: "40000000-0000-4000-8000-000000000001",
      direction: StockMovementDirection.OUT,
    };
    const createMovement = jest.fn().mockResolvedValue(movement);
    const repository = new StockReservationsRepository(
      createPrismaMock(
        createTransactionMock({
          inventoryItem: { updateManyAndReturn: updateItem },
          stockReservation: { updateManyAndReturn: updateReservation },
          stockMovement: { create: createMovement },
        }),
      ),
    );

    const result = await repository.consume(workspaceId, reservationId);

    expect(result).toEqual({ reservation, movement });
    expect(updateItem).toHaveBeenCalledWith({
      where: {
        id: inventoryItemId,
        workspaceId,
        isActive: true,
        quantityOnHand: { gte: reservation.quantity },
        quantityReserved: { gte: reservation.quantity },
      },
      data: {
        quantityOnHand: { decrement: reservation.quantity },
        quantityReserved: { decrement: reservation.quantity },
      },
      select: { quantityOnHand: true },
    });
    const movementData = createMovement.mock.calls[0][0].data;
    expect(movementData.direction).toBe(StockMovementDirection.OUT);
    expect(movementData.quantityBefore.toString()).toBe("10");
    expect(movementData.quantityAfter.toString()).toBe("6");
    expect(movementData.referenceType).toBe("STOCK_RESERVATION");
    expect(movementData.referenceId).toBe(reservationId);
  });

  it("finds reservations with workspace isolation", async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prisma = {
      stockReservation: { findFirst },
    } as unknown as PrismaService;
    const repository = new StockReservationsRepository(prisma);

    await repository.findById(workspaceId, reservationId);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: reservationId, workspaceId },
    });
  });

  function createReservation(status: StockReservationStatus) {
    return {
      id: reservationId,
      workspaceId,
      inventoryItemId,
      quantity: new Prisma.Decimal(4),
      status,
      referenceType: "SALES_ORDER",
      referenceId: "SO-001",
      expiresAt: null,
      releasedAt:
        status === StockReservationStatus.RELEASED
          ? new Date("2026-01-02T00:00:00.000Z")
          : null,
      consumedAt:
        status === StockReservationStatus.CONSUMED
          ? new Date("2026-01-02T00:00:00.000Z")
          : null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  }
});

function createTransactionMock(transaction: Record<string, unknown>) {
  return jest.fn(async (callback: (value: unknown) => unknown) =>
    callback(transaction),
  );
}

function createPrismaMock(transaction: jest.Mock): PrismaService {
  return { $transaction: transaction } as unknown as PrismaService;
}
