import { Injectable } from "@nestjs/common";
import {
  Prisma,
  StockMovementDirection,
  StockReservationStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type StockReservationRecord = Prisma.StockReservationGetPayload<object>;
export type ReservationInventoryItem = Prisma.InventoryItemGetPayload<object>;
export type ReservationMovement = Prisma.StockMovementGetPayload<object>;

export interface CreateStockReservationData {
  workspaceId: string;
  inventoryItemId: string;
  quantity: Prisma.Decimal;
  referenceType?: string;
  referenceId?: string;
  expiresAt?: Date;
}

export interface ConsumedStockReservation {
  reservation: StockReservationRecord;
  movement: ReservationMovement;
}

export class StockReservationOperationRejectedError extends Error {
  constructor() {
    super("Stock reservation operation was rejected");
    this.name = "StockReservationOperationRejectedError";
  }
}

@Injectable()
export class StockReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createAndReserve(
    data: CreateStockReservationData,
  ): Promise<StockReservationRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const updatedItems =
        await transaction.inventoryItem.updateManyAndReturn({
          where: {
            id: data.inventoryItemId,
            workspaceId: data.workspaceId,
            isActive: true,
          },
          data: { quantityReserved: { increment: data.quantity } },
          select: { quantityOnHand: true, quantityReserved: true },
        });
      const updatedItem = updatedItems[0];

      if (
        !updatedItem ||
        updatedItem.quantityReserved.greaterThan(updatedItem.quantityOnHand)
      ) {
        throw new StockReservationOperationRejectedError();
      }

      return transaction.stockReservation.create({
        data: {
          workspaceId: data.workspaceId,
          inventoryItemId: data.inventoryItemId,
          quantity: data.quantity,
          ...(data.referenceType === undefined
            ? {}
            : { referenceType: data.referenceType }),
          ...(data.referenceId === undefined
            ? {}
            : { referenceId: data.referenceId }),
          ...(data.expiresAt === undefined
            ? {}
            : { expiresAt: data.expiresAt }),
        },
      });
    });
  }

  release(
    workspaceId: string,
    id: string,
    status:
      | typeof StockReservationStatus.RELEASED
      | typeof StockReservationStatus.CANCELLED,
  ): Promise<StockReservationRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const releasedAt = new Date();
      const reservations =
        await transaction.stockReservation.updateManyAndReturn({
          where: {
            id,
            workspaceId,
            status: StockReservationStatus.ACTIVE,
          },
          data: { status, releasedAt },
        });
      const reservation = reservations[0];

      if (!reservation) {
        throw new StockReservationOperationRejectedError();
      }

      const updatedItems =
        await transaction.inventoryItem.updateManyAndReturn({
          where: {
            id: reservation.inventoryItemId,
            workspaceId,
            quantityReserved: { gte: reservation.quantity },
          },
          data: {
            quantityReserved: { decrement: reservation.quantity },
          },
          select: { id: true },
        });

      if (!updatedItems[0]) {
        throw new StockReservationOperationRejectedError();
      }

      return reservation;
    });
  }

  consume(
    workspaceId: string,
    id: string,
  ): Promise<ConsumedStockReservation> {
    return this.prisma.$transaction(async (transaction) => {
      const consumedAt = new Date();
      const reservations =
        await transaction.stockReservation.updateManyAndReturn({
          where: {
            id,
            workspaceId,
            status: StockReservationStatus.ACTIVE,
          },
          data: {
            status: StockReservationStatus.CONSUMED,
            consumedAt,
          },
        });
      const reservation = reservations[0];

      if (!reservation) {
        throw new StockReservationOperationRejectedError();
      }

      const updatedItems =
        await transaction.inventoryItem.updateManyAndReturn({
          where: {
            id: reservation.inventoryItemId,
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
      const updatedItem = updatedItems[0];

      if (!updatedItem) {
        throw new StockReservationOperationRejectedError();
      }

      const movement = await transaction.stockMovement.create({
        data: {
          workspaceId,
          inventoryItemId: reservation.inventoryItemId,
          direction: StockMovementDirection.OUT,
          quantity: reservation.quantity,
          quantityBefore: updatedItem.quantityOnHand.plus(
            reservation.quantity,
          ),
          quantityAfter: updatedItem.quantityOnHand,
          referenceType: "STOCK_RESERVATION",
          referenceId: reservation.id,
          occurredAt: consumedAt,
        },
      });

      return { reservation, movement };
    });
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<StockReservationRecord | null> {
    return this.prisma.stockReservation.findFirst({
      where: { id, workspaceId },
    });
  }

  findByInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockReservationRecord[]> {
    return this.prisma.stockReservation.findMany({
      where: { workspaceId, inventoryItemId },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });
  }

  findByWorkspace(workspaceId: string): Promise<StockReservationRecord[]> {
    return this.prisma.stockReservation.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });
  }

  findInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<ReservationInventoryItem | null> {
    return this.prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, workspaceId },
    });
  }
}
