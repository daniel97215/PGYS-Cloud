import { Injectable } from "@nestjs/common";
import { Prisma, StockMovementDirection } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type StockMovementRecord = Prisma.StockMovementGetPayload<object>;
export type StockMovementInventoryItem = Prisma.InventoryItemGetPayload<object>;

export interface CreateStockMovementData {
  workspaceId: string;
  inventoryItemId: string;
  direction: StockMovementDirection;
  quantity: Prisma.Decimal;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  occurredAt?: Date;
}

export interface CreateStockTransferData {
  workspaceId: string;
  sourceInventoryItemId: string;
  destinationInventoryItemId: string;
  quantity: Prisma.Decimal;
  referenceId: string;
  reason?: string;
}

export interface CreateInboundStockMovementData {
  workspaceId: string;
  inventoryItemId: string;
  quantity: Prisma.Decimal;
  referenceType: string;
  referenceId: string;
  occurredAt: Date;
  reason?: string;
}

export interface CreateOutboundStockMovementData {
  workspaceId: string;
  inventoryItemId: string;
  quantity: Prisma.Decimal;
  referenceType: string;
  referenceId: string;
  occurredAt: Date;
  reason?: string;
}

export interface StockTransferMovements {
  outMovement: StockMovementRecord;
  inMovement: StockMovementRecord;
}

export class StockUpdateRejectedError extends Error {
  constructor() {
    super("Inventory item stock update was rejected");
    this.name = "StockUpdateRejectedError";
  }
}

export class StockTransferRejectedError extends Error {
  constructor() {
    super("Stock transfer update was rejected");
    this.name = "StockTransferRejectedError";
  }
}

@Injectable()
export class StockMovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createMovementAndUpdateStock(
    data: CreateStockMovementData,
  ): Promise<StockMovementRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const isInbound = data.direction === StockMovementDirection.IN;
      const updatedItems = await transaction.inventoryItem.updateManyAndReturn({
        where: {
          id: data.inventoryItemId,
          workspaceId: data.workspaceId,
          isActive: true,
          ...(isInbound
            ? {}
            : { quantityOnHand: { gte: data.quantity } }),
        },
        data: {
          quantityOnHand: isInbound
            ? { increment: data.quantity }
            : { decrement: data.quantity },
        },
        select: { quantityOnHand: true, quantityReserved: true },
      });

      const updatedItem = updatedItems[0];

      if (!updatedItem) {
        throw new StockUpdateRejectedError();
      }

      if (
        !isInbound &&
        updatedItem.quantityOnHand.lessThan(updatedItem.quantityReserved)
      ) {
        throw new StockUpdateRejectedError();
      }

      const quantityAfter = updatedItem.quantityOnHand;
      const quantityBefore = isInbound
        ? quantityAfter.minus(data.quantity)
        : quantityAfter.plus(data.quantity);

      return transaction.stockMovement.create({
        data: {
          workspaceId: data.workspaceId,
          inventoryItemId: data.inventoryItemId,
          direction: data.direction,
          quantity: data.quantity,
          quantityBefore,
          quantityAfter,
          ...(data.reason === undefined ? {} : { reason: data.reason }),
          ...(data.referenceType === undefined
            ? {}
            : { referenceType: data.referenceType }),
          ...(data.referenceId === undefined
            ? {}
            : { referenceId: data.referenceId }),
          ...(data.occurredAt === undefined
            ? {}
            : { occurredAt: data.occurredAt }),
        },
      });
    });
  }

  createTransferAndUpdateStock(
    data: CreateStockTransferData,
  ): Promise<StockTransferMovements> {
    return this.prisma.$transaction(async (transaction) => {
      const updatedSources =
        await transaction.inventoryItem.updateManyAndReturn({
          where: {
            id: data.sourceInventoryItemId,
            workspaceId: data.workspaceId,
            isActive: true,
            quantityOnHand: { gte: data.quantity },
          },
          data: { quantityOnHand: { decrement: data.quantity } },
          select: { quantityOnHand: true, quantityReserved: true },
        });
      const updatedSource = updatedSources[0];

      if (!updatedSource) {
        throw new StockTransferRejectedError();
      }

      if (
        updatedSource.quantityOnHand.lessThan(updatedSource.quantityReserved)
      ) {
        throw new StockTransferRejectedError();
      }

      const occurredAt = new Date();
      const outQuantityAfter = updatedSource.quantityOnHand;
      const outMovement = await transaction.stockMovement.create({
        data: {
          workspaceId: data.workspaceId,
          inventoryItemId: data.sourceInventoryItemId,
          direction: StockMovementDirection.OUT,
          quantity: data.quantity,
          quantityBefore: outQuantityAfter.plus(data.quantity),
          quantityAfter: outQuantityAfter,
          referenceType: "STOCK_TRANSFER",
          referenceId: data.referenceId,
          occurredAt,
          ...(data.reason === undefined ? {} : { reason: data.reason }),
        },
      });

      const updatedDestinations =
        await transaction.inventoryItem.updateManyAndReturn({
          where: {
            id: data.destinationInventoryItemId,
            workspaceId: data.workspaceId,
            isActive: true,
          },
          data: { quantityOnHand: { increment: data.quantity } },
          select: { quantityOnHand: true },
        });
      const updatedDestination = updatedDestinations[0];

      if (!updatedDestination) {
        throw new StockTransferRejectedError();
      }

      const inQuantityAfter = updatedDestination.quantityOnHand;
      const inMovement = await transaction.stockMovement.create({
        data: {
          workspaceId: data.workspaceId,
          inventoryItemId: data.destinationInventoryItemId,
          direction: StockMovementDirection.IN,
          quantity: data.quantity,
          quantityBefore: inQuantityAfter.minus(data.quantity),
          quantityAfter: inQuantityAfter,
          referenceType: "STOCK_TRANSFER",
          referenceId: data.referenceId,
          occurredAt,
          ...(data.reason === undefined ? {} : { reason: data.reason }),
        },
      });

      return { outMovement, inMovement };
    });
  }

  async createInboundMovementInTransaction(
    transaction: Prisma.TransactionClient,
    data: CreateInboundStockMovementData,
  ): Promise<StockMovementRecord> {
    const updatedItems = await transaction.inventoryItem.updateManyAndReturn({
      where: {
        id: data.inventoryItemId,
        workspaceId: data.workspaceId,
        isActive: true,
      },
      data: { quantityOnHand: { increment: data.quantity } },
      select: { quantityOnHand: true },
    });
    const updatedItem = updatedItems[0];

    if (!updatedItem) {
      throw new StockUpdateRejectedError();
    }

    return transaction.stockMovement.create({
      data: {
        workspaceId: data.workspaceId,
        inventoryItemId: data.inventoryItemId,
        direction: StockMovementDirection.IN,
        quantity: data.quantity,
        quantityBefore: updatedItem.quantityOnHand.minus(data.quantity),
        quantityAfter: updatedItem.quantityOnHand,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        occurredAt: data.occurredAt,
        ...(data.reason === undefined ? {} : { reason: data.reason }),
      },
    });
  }

  async createOutboundMovementInTransaction(
    transaction: Prisma.TransactionClient,
    data: CreateOutboundStockMovementData,
  ): Promise<StockMovementRecord> {
    const updatedItems = await transaction.inventoryItem.updateManyAndReturn({
      where: {
        id: data.inventoryItemId,
        workspaceId: data.workspaceId,
        isActive: true,
        quantityOnHand: { gte: data.quantity },
      },
      data: { quantityOnHand: { decrement: data.quantity } },
      select: { quantityOnHand: true, quantityReserved: true },
    });
    const updatedItem = updatedItems[0];

    if (
      !updatedItem ||
      updatedItem.quantityOnHand.lessThan(updatedItem.quantityReserved)
    ) {
      throw new StockUpdateRejectedError();
    }

    return transaction.stockMovement.create({
      data: {
        workspaceId: data.workspaceId,
        inventoryItemId: data.inventoryItemId,
        direction: StockMovementDirection.OUT,
        quantity: data.quantity,
        quantityBefore: updatedItem.quantityOnHand.plus(data.quantity),
        quantityAfter: updatedItem.quantityOnHand,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        occurredAt: data.occurredAt,
        ...(data.reason === undefined ? {} : { reason: data.reason }),
      },
    });
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<StockMovementRecord | null> {
    return this.prisma.stockMovement.findFirst({
      where: { id, workspaceId },
    });
  }

  findByInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockMovementRecord[]> {
    return this.prisma.stockMovement.findMany({
      where: { workspaceId, inventoryItemId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  }

  findByWorkspace(workspaceId: string): Promise<StockMovementRecord[]> {
    return this.prisma.stockMovement.findMany({
      where: { workspaceId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  }

  findInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockMovementInventoryItem | null> {
    return this.prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, workspaceId },
    });
  }
}
