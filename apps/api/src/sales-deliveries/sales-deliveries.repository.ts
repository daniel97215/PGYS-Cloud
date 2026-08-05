import { Injectable } from "@nestjs/common";
import {
  Prisma,
  SalesDeliveryStatus,
  SalesOrderStatus,
  StockMovementDirection,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type SalesDeliveryRecord = Prisma.SalesDeliveryGetPayload<object>;
export type SalesDeliveryWithLines = Prisma.SalesDeliveryGetPayload<{
  include: { lines: true };
}>;

export interface CreateSalesDeliveryData {
  workspaceId: string;
  number: string;
  salesOrderId: string;
  deliveryAddress?: Prisma.InputJsonValue;
  notes?: string;
}

export interface AddSalesDeliveryLineData {
  workspaceId: string;
  salesDeliveryId: string;
  salesOrderLineId: string;
  inventoryItemId: string;
  quantity: Prisma.Decimal;
}

export class SalesDeliveryOrderUnavailableError extends Error {
  constructor() {
    super("Sales order is unavailable for delivery");
    this.name = "SalesDeliveryOrderUnavailableError";
  }
}

export class SalesDeliveryStateConflictError extends Error {
  constructor() {
    super("Sales delivery state changed concurrently");
    this.name = "SalesDeliveryStateConflictError";
  }
}

export class SalesDeliveryLineReferenceError extends Error {
  constructor() {
    super("Sales delivery line references are inconsistent");
    this.name = "SalesDeliveryLineReferenceError";
  }
}

export class SalesDeliveryOverQuantityError extends Error {
  constructor() {
    super("Delivered quantity would exceed ordered quantity");
    this.name = "SalesDeliveryOverQuantityError";
  }
}

export class SalesDeliveryLineNotFoundError extends Error {
  constructor() {
    super("Sales delivery line was not found");
    this.name = "SalesDeliveryLineNotFoundError";
  }
}

export class SalesDeliveryStockRejectedError extends Error {
  constructor() {
    super("Available inventory is insufficient for shipment");
    this.name = "SalesDeliveryStockRejectedError";
  }
}

@Injectable()
export class SalesDeliveriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSalesDeliveryData): Promise<SalesDeliveryWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const order = await transaction.salesOrder.findFirst({
          where: {
            id: data.salesOrderId,
            workspaceId: data.workspaceId,
            status: {
              in: [SalesOrderStatus.CONFIRMED, SalesOrderStatus.PROCESSING],
            },
          },
          select: { id: true },
        });

        if (!order) {
          throw new SalesDeliveryOrderUnavailableError();
        }

        return transaction.salesDelivery.create({
          data,
          include: { lines: { orderBy: this.lineOrder } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines | null> {
    return this.prisma.salesDelivery.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<SalesDeliveryRecord[]> {
    return this.prisma.salesDelivery.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { number: "asc" }],
    });
  }

  addLine(
    data: AddSalesDeliveryLineData,
  ): Promise<SalesDeliveryWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const delivery = await transaction.salesDelivery.findFirst({
          where: {
            id: data.salesDeliveryId,
            workspaceId: data.workspaceId,
            status: SalesDeliveryStatus.DRAFT,
          },
          select: { id: true, salesOrderId: true },
        });

        if (!delivery) {
          throw new SalesDeliveryStateConflictError();
        }

        const orderLine = await transaction.salesOrderLine.findFirst({
          where: {
            id: data.salesOrderLineId,
            workspaceId: data.workspaceId,
            salesOrderId: delivery.salesOrderId,
          },
        });
        const inventoryItem = await transaction.inventoryItem.findFirst({
          where: {
            id: data.inventoryItemId,
            workspaceId: data.workspaceId,
            isActive: true,
          },
          select: { productId: true, productVariantId: true },
        });

        if (!orderLine || !inventoryItem) {
          throw new SalesDeliveryLineReferenceError();
        }

        if (
          inventoryItem.productId !== orderLine.productId ||
          inventoryItem.productVariantId !== orderLine.productVariantId
        ) {
          throw new SalesDeliveryLineReferenceError();
        }

        const delivered = await transaction.salesDeliveryLine.aggregate({
          where: {
            workspaceId: data.workspaceId,
            salesOrderLineId: data.salesOrderLineId,
            salesDelivery: {
              salesOrderId: delivery.salesOrderId,
              status: { not: SalesDeliveryStatus.CANCELLED },
            },
          },
          _sum: { quantity: true },
        });
        const deliveredQuantity =
          delivered._sum.quantity ?? new Prisma.Decimal(0);

        if (deliveredQuantity.plus(data.quantity).greaterThan(orderLine.quantity)) {
          throw new SalesDeliveryOverQuantityError();
        }

        await transaction.salesDeliveryLine.create({ data });
        return this.findByIdOrThrow(
          transaction,
          data.workspaceId,
          data.salesDeliveryId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  removeLine(
    workspaceId: string,
    salesDeliveryId: string,
    lineId: string,
  ): Promise<SalesDeliveryWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftDelivery(
          transaction,
          workspaceId,
          salesDeliveryId,
        );
        const deleted = await transaction.salesDeliveryLine.deleteMany({
          where: { id: lineId, workspaceId, salesDeliveryId },
        });

        if (deleted.count !== 1) {
          throw new SalesDeliveryLineNotFoundError();
        }

        return this.findByIdOrThrow(
          transaction,
          workspaceId,
          salesDeliveryId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  ready(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [SalesDeliveryStatus.DRAFT],
      SalesDeliveryStatus.READY,
      true,
    );
  }

  ship(workspaceId: string, id: string): Promise<SalesDeliveryWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const shippedAt = new Date();
        const deliveries =
          await transaction.salesDelivery.updateManyAndReturn({
            where: { id, workspaceId, status: SalesDeliveryStatus.READY },
            data: { status: SalesDeliveryStatus.SHIPPED, shippedAt },
            select: { id: true, salesOrderId: true },
          });
        const delivery = deliveries[0];

        if (!delivery) {
          throw new SalesDeliveryStateConflictError();
        }

        const orders = await transaction.salesOrder.updateManyAndReturn({
          where: {
            id: delivery.salesOrderId,
            workspaceId,
            status: {
              in: [SalesOrderStatus.CONFIRMED, SalesOrderStatus.PROCESSING],
            },
          },
          data: { status: SalesOrderStatus.PROCESSING },
          select: { id: true },
        });

        if (!orders[0]) {
          throw new SalesDeliveryOrderUnavailableError();
        }

        const lines = await transaction.salesDeliveryLine.findMany({
          where: { workspaceId, salesDeliveryId: id },
          orderBy: { id: "asc" },
        });

        for (const line of lines) {
          const inventoryItems =
            await transaction.inventoryItem.updateManyAndReturn({
              where: {
                id: line.inventoryItemId,
                workspaceId,
                isActive: true,
                quantityOnHand: { gte: line.quantity },
              },
              data: { quantityOnHand: { decrement: line.quantity } },
              select: { quantityOnHand: true, quantityReserved: true },
            });
          const inventoryItem = inventoryItems[0];

          if (
            !inventoryItem ||
            inventoryItem.quantityOnHand.lessThan(
              inventoryItem.quantityReserved,
            )
          ) {
            throw new SalesDeliveryStockRejectedError();
          }

          await transaction.stockMovement.create({
            data: {
              workspaceId,
              inventoryItemId: line.inventoryItemId,
              direction: StockMovementDirection.OUT,
              quantity: line.quantity,
              quantityBefore: inventoryItem.quantityOnHand.plus(line.quantity),
              quantityAfter: inventoryItem.quantityOnHand,
              referenceType: "SALES_DELIVERY",
              referenceId: id,
              occurredAt: shippedAt,
            },
          });
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  deliver(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [SalesDeliveryStatus.SHIPPED],
      SalesDeliveryStatus.DELIVERED,
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [SalesDeliveryStatus.DRAFT, SalesDeliveryStatus.READY],
      SalesDeliveryStatus.CANCELLED,
    );
  }

  private transitionStatus(
    workspaceId: string,
    id: string,
    fromStatuses: SalesDeliveryStatus[],
    toStatus: SalesDeliveryStatus,
    requireLines = false,
  ): Promise<SalesDeliveryWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const transitionedAt = new Date();
        const deliveries =
          await transaction.salesDelivery.updateManyAndReturn({
            where: {
              id,
              workspaceId,
              status: { in: fromStatuses },
              ...(requireLines ? { lines: { some: {} } } : {}),
            },
            data: {
              status: toStatus,
              ...(toStatus === SalesDeliveryStatus.DELIVERED
                ? { deliveredAt: transitionedAt }
                : {}),
            },
            select: { id: true },
          });

        if (!deliveries[0]) {
          return null;
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async claimDraftDelivery(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const claimed = await transaction.salesDelivery.updateMany({
      where: { id, workspaceId, status: SalesDeliveryStatus.DRAFT },
      data: { updatedAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new SalesDeliveryStateConflictError();
    }
  }

  private findByIdOrThrow(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines> {
    return transaction.salesDelivery.findUniqueOrThrow({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  private readonly lineOrder = [
    { createdAt: "asc" as const },
    { id: "asc" as const },
  ];
}
