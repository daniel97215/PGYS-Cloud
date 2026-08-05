import { Injectable } from "@nestjs/common";
import {
  InventoryCountStatus,
  Prisma,
  StockMovementDirection,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type InventoryCountRecord = Prisma.InventoryCountGetPayload<object>;
export type InventoryCountWithLines = Prisma.InventoryCountGetPayload<{
  include: { lines: true };
}>;
export type InventoryCountLineRecord =
  Prisma.InventoryCountLineGetPayload<object>;

export interface CreateInventoryCountData {
  workspaceId: string;
  warehouseId: string;
  storageLocationId: string;
  code: string;
  description?: string;
}

export interface StorageLocationReference {
  id: string;
  warehouseId: string;
}

export class InventoryCountStateConflictError extends Error {
  constructor() {
    super("Inventory count state changed concurrently");
    this.name = "InventoryCountStateConflictError";
  }
}

export class IncompleteInventoryCountError extends Error {
  constructor() {
    super("Every inventory count line must be counted");
    this.name = "IncompleteInventoryCountError";
  }
}

export class InventoryCountStockUpdateError extends Error {
  constructor() {
    super("An inventory item could not be updated");
    this.name = "InventoryCountStockUpdateError";
  }
}

@Injectable()
export class InventoryCountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWithLines(
    data: CreateInventoryCountData,
  ): Promise<InventoryCountWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const inventoryItems = await transaction.inventoryItem.findMany({
          where: {
            workspaceId: data.workspaceId,
            warehouseId: data.warehouseId,
            storageLocationId: data.storageLocationId,
            isActive: true,
          },
          select: { id: true, quantityOnHand: true },
          orderBy: { id: "asc" },
        });

        return transaction.inventoryCount.create({
          data: {
            workspaceId: data.workspaceId,
            warehouseId: data.warehouseId,
            storageLocationId: data.storageLocationId,
            code: data.code,
            ...(data.description === undefined
              ? {}
              : { description: data.description }),
            lines: {
              create: inventoryItems.map((inventoryItem) => ({
                workspaceId: data.workspaceId,
                inventoryItemId: inventoryItem.id,
                expectedQuantity: inventoryItem.quantityOnHand,
              })),
            },
          },
          include: { lines: { orderBy: { createdAt: "asc" } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<InventoryCountWithLines | null> {
    return this.prisma.inventoryCount.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: { createdAt: "asc" } } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<InventoryCountRecord[]> {
    return this.prisma.inventoryCount.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
    });
  }

  updateLine(
    workspaceId: string,
    inventoryCountId: string,
    lineId: string,
    countedQuantity: Prisma.Decimal,
    variance: Prisma.Decimal,
  ): Promise<InventoryCountLineRecord> {
    return this.prisma.inventoryCountLine.update({
      where: { id: lineId, workspaceId, inventoryCountId },
      data: { countedQuantity, variance },
    });
  }

  async transitionStatus(
    workspaceId: string,
    id: string,
    fromStatus: InventoryCountStatus,
    toStatus: InventoryCountStatus,
  ): Promise<InventoryCountRecord | null> {
    const counts = await this.prisma.inventoryCount.updateManyAndReturn({
      where: { id, workspaceId, status: fromStatus },
      data: { status: toStatus },
    });

    return counts[0] ?? null;
  }

  complete(
    workspaceId: string,
    id: string,
  ): Promise<InventoryCountWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const completedAt = new Date();
        const claimedCounts =
          await transaction.inventoryCount.updateManyAndReturn({
            where: {
              id,
              workspaceId,
              status: InventoryCountStatus.IN_PROGRESS,
            },
            data: {
              status: InventoryCountStatus.COMPLETED,
              completedAt,
            },
            select: { id: true },
          });

        if (!claimedCounts[0]) {
          throw new InventoryCountStateConflictError();
        }

        const lines = await transaction.inventoryCountLine.findMany({
          where: { workspaceId, inventoryCountId: id },
          orderBy: { createdAt: "asc" },
        });

        if (lines.some((line) => line.countedQuantity === null)) {
          throw new IncompleteInventoryCountError();
        }

        for (const line of lines) {
          const countedQuantity = line.countedQuantity as Prisma.Decimal;
          const variance = countedQuantity.minus(line.expectedQuantity);

          if (variance.isZero()) {
            continue;
          }

          const updatedItems =
            await transaction.inventoryItem.updateManyAndReturn({
              where: {
                id: line.inventoryItemId,
                workspaceId,
                isActive: true,
              },
              data: { quantityOnHand: countedQuantity },
              select: { id: true, quantityReserved: true },
            });

          if (!updatedItems[0]) {
            throw new InventoryCountStockUpdateError();
          }

          if (countedQuantity.lessThan(updatedItems[0].quantityReserved)) {
            throw new InventoryCountStockUpdateError();
          }

          await transaction.stockMovement.create({
            data: {
              workspaceId,
              inventoryItemId: line.inventoryItemId,
              direction: variance.isPositive()
                ? StockMovementDirection.IN
                : StockMovementDirection.OUT,
              quantity: variance.abs(),
              quantityBefore: line.expectedQuantity,
              quantityAfter: countedQuantity,
              referenceType: "INVENTORY_COUNT",
              referenceId: id,
              occurredAt: completedAt,
            },
          });
        }

        return transaction.inventoryCount.findUniqueOrThrow({
          where: { id },
          include: { lines: { orderBy: { createdAt: "asc" } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async warehouseBelongsToWorkspace(
    workspaceId: string,
    warehouseId: string,
  ): Promise<boolean> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: warehouseId, workspaceId },
      select: { id: true },
    });

    return warehouse !== null;
  }

  findStorageLocation(
    workspaceId: string,
    storageLocationId: string,
  ): Promise<StorageLocationReference | null> {
    return this.prisma.storageLocation.findFirst({
      where: { id: storageLocationId, workspaceId },
      select: { id: true, warehouseId: true },
    });
  }
}
