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

export class StockUpdateRejectedError extends Error {
  constructor() {
    super("Inventory item stock update was rejected");
    this.name = "StockUpdateRejectedError";
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
        select: { quantityOnHand: true },
      });

      const updatedItem = updatedItems[0];

      if (!updatedItem) {
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
