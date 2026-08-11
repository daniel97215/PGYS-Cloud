import { Injectable } from "@nestjs/common";
import {
  Prisma,
  PurchaseOrderStatus,
  PurchaseReceiptStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PurchaseOrdersRepository } from "../purchase-orders/purchase-orders.repository";
import {
  StockMovementsRepository,
  StockUpdateRejectedError,
} from "../stock-movements/stock-movements.repository";

export type PurchaseReceiptRecord = Prisma.PurchaseReceiptGetPayload<object>;
export type PurchaseReceiptWithLines = Prisma.PurchaseReceiptGetPayload<{
  include: { lines: true };
}>;
export type PurchaseReceiptLineRecord =
  Prisma.PurchaseReceiptLineGetPayload<object>;

export interface CreatePurchaseReceiptData {
  workspaceId: string;
  number: string;
  purchaseOrderId: string;
  warehouseId: string;
  supplierReference?: string;
  notes?: string;
}

export interface UpdatePurchaseReceiptData {
  number?: string;
  supplierReference?: string;
  notes?: string;
}

export interface PurchaseReceiptLineData {
  workspaceId: string;
  purchaseReceiptId: string;
  purchaseOrderLineId: string;
  inventoryItemId: string;
  quantity: Prisma.Decimal;
}

export class PurchaseReceiptOrderUnavailableError extends Error {
  constructor() {
    super("Purchase order is unavailable for receipt");
    this.name = "PurchaseReceiptOrderUnavailableError";
  }
}

export class PurchaseReceiptStateConflictError extends Error {
  constructor() {
    super("Purchase receipt state changed concurrently");
    this.name = "PurchaseReceiptStateConflictError";
  }
}

export class PurchaseReceiptLineReferenceError extends Error {
  constructor() {
    super("Purchase receipt line references are inconsistent");
    this.name = "PurchaseReceiptLineReferenceError";
  }
}

export class PurchaseReceiptOverQuantityError extends Error {
  constructor() {
    super("Received quantity would exceed ordered quantity");
    this.name = "PurchaseReceiptOverQuantityError";
  }
}

export class PurchaseReceiptLineNotFoundError extends Error {
  constructor() {
    super("Purchase receipt line was not found");
    this.name = "PurchaseReceiptLineNotFoundError";
  }
}

export class PurchaseReceiptEmptyError extends Error {
  constructor() {
    super("Purchase receipt has no lines");
    this.name = "PurchaseReceiptEmptyError";
  }
}

export class PurchaseReceiptStockRejectedError extends Error {
  constructor() {
    super("Purchase receipt stock update was rejected");
    this.name = "PurchaseReceiptStockRejectedError";
  }
}

interface ReceiptContext {
  purchaseOrderId: string;
  warehouseId: string;
}

@Injectable()
export class PurchaseReceiptsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    private readonly stockMovementsRepository: StockMovementsRepository,
  ) {}

  create(data: CreatePurchaseReceiptData): Promise<PurchaseReceiptWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const order = await transaction.purchaseOrder.findFirst({
          where: {
            id: data.purchaseOrderId,
            workspaceId: data.workspaceId,
            warehouseId: data.warehouseId,
            status: {
              in: [
                PurchaseOrderStatus.CONFIRMED,
                PurchaseOrderStatus.PARTIALLY_RECEIVED,
              ],
            },
          },
          select: { id: true },
        });

        if (!order) {
          throw new PurchaseReceiptOrderUnavailableError();
        }

        return transaction.purchaseReceipt.create({
          data,
          include: { lines: { orderBy: this.lineOrder } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseReceiptData,
  ): Promise<PurchaseReceiptWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const receipts =
          await transaction.purchaseReceipt.updateManyAndReturn({
            where: { id, workspaceId, status: PurchaseReceiptStatus.DRAFT },
            data,
            select: { id: true },
          });

        if (!receipts[0]) {
          throw new PurchaseReceiptStateConflictError();
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines | null> {
    return this.prisma.purchaseReceipt.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<PurchaseReceiptRecord[]> {
    return this.prisma.purchaseReceipt.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { number: "asc" }],
    });
  }

  findReceivedInTransaction(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptRecord | null> {
    return transaction.purchaseReceipt.findFirst({
      where: { id, workspaceId, status: PurchaseReceiptStatus.RECEIVED },
    });
  }

  findReceivedLineInTransaction(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    purchaseReceiptId: string,
    lineId: string,
    inventoryItemId: string,
  ): Promise<PurchaseReceiptLineRecord | null> {
    return transaction.purchaseReceiptLine.findFirst({
      where: {
        id: lineId,
        workspaceId,
        purchaseReceiptId,
        inventoryItemId,
        purchaseReceipt: { status: PurchaseReceiptStatus.RECEIVED },
      },
    });
  }

  addLine(data: PurchaseReceiptLineData): Promise<PurchaseReceiptWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const receipt = await this.requireDraftContext(
          transaction,
          data.workspaceId,
          data.purchaseReceiptId,
        );
        const orderLine = await this.validateLineReferences(
          transaction,
          receipt,
          data,
        );
        await this.validateQuantity(
          transaction,
          data.workspaceId,
          receipt.purchaseOrderId,
          data.purchaseReceiptId,
          data.purchaseOrderLineId,
          data.quantity,
          orderLine.quantity,
        );

        await transaction.purchaseReceiptLine.create({ data });
        return this.findByIdOrThrow(
          transaction,
          data.workspaceId,
          data.purchaseReceiptId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  updateLine(
    workspaceId: string,
    purchaseReceiptId: string,
    lineId: string,
    data: Omit<PurchaseReceiptLineData, "workspaceId" | "purchaseReceiptId">,
  ): Promise<PurchaseReceiptWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const receipt = await this.requireDraftContext(
          transaction,
          workspaceId,
          purchaseReceiptId,
        );
        const existingLine = await transaction.purchaseReceiptLine.findFirst({
          where: { id: lineId, workspaceId, purchaseReceiptId },
          select: { id: true },
        });

        if (!existingLine) {
          throw new PurchaseReceiptLineNotFoundError();
        }

        const lineData = { workspaceId, purchaseReceiptId, ...data };
        const orderLine = await this.validateLineReferences(
          transaction,
          receipt,
          lineData,
        );
        await this.validateQuantity(
          transaction,
          workspaceId,
          receipt.purchaseOrderId,
          purchaseReceiptId,
          data.purchaseOrderLineId,
          data.quantity,
          orderLine.quantity,
          lineId,
        );

        await transaction.purchaseReceiptLine.update({
          where: { id: lineId, workspaceId, purchaseReceiptId },
          data,
        });
        return this.findByIdOrThrow(
          transaction,
          workspaceId,
          purchaseReceiptId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  confirm(workspaceId: string, id: string): Promise<PurchaseReceiptWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const receivedAt = new Date();
        const receipts =
          await transaction.purchaseReceipt.updateManyAndReturn({
            where: {
              id,
              workspaceId,
              status: {
                in: [PurchaseReceiptStatus.DRAFT, PurchaseReceiptStatus.READY],
              },
              lines: { some: {} },
            },
            data: { status: PurchaseReceiptStatus.RECEIVED, receivedAt },
            select: { id: true, purchaseOrderId: true, warehouseId: true },
          });
        const receipt = receipts[0];

        if (!receipt) {
          throw new PurchaseReceiptStateConflictError();
        }

        const order = await transaction.purchaseOrder.findFirst({
          where: {
            id: receipt.purchaseOrderId,
            workspaceId,
            warehouseId: receipt.warehouseId,
            status: {
              in: [
                PurchaseOrderStatus.CONFIRMED,
                PurchaseOrderStatus.PARTIALLY_RECEIVED,
              ],
            },
          },
          select: { id: true },
        });

        if (!order) {
          throw new PurchaseReceiptOrderUnavailableError();
        }

        const lines = await transaction.purchaseReceiptLine.findMany({
          where: { workspaceId, purchaseReceiptId: id },
          orderBy: { id: "asc" },
        });

        if (lines.length === 0) {
          throw new PurchaseReceiptEmptyError();
        }

        const groupedQuantities = new Map<string, Prisma.Decimal>();

        for (const line of lines) {
          if (line.quantity.lessThanOrEqualTo(0)) {
            throw new PurchaseReceiptOverQuantityError();
          }

          await this.validateLineReferences(transaction, receipt, line);
          groupedQuantities.set(
            line.purchaseOrderLineId,
            (groupedQuantities.get(line.purchaseOrderLineId) ??
              new Prisma.Decimal(0)).plus(line.quantity),
          );
        }

        for (const [orderLineId, currentQuantity] of groupedQuantities) {
          const orderLine = await transaction.purchaseOrderLine.findFirst({
            where: {
              id: orderLineId,
              workspaceId,
              purchaseOrderId: receipt.purchaseOrderId,
            },
            select: { quantity: true },
          });

          if (!orderLine) {
            throw new PurchaseReceiptLineReferenceError();
          }

          const previous = await this.receivedQuantity(
            transaction,
            workspaceId,
            receipt.purchaseOrderId,
            orderLineId,
            id,
          );

          if (previous.plus(currentQuantity).greaterThan(orderLine.quantity)) {
            throw new PurchaseReceiptOverQuantityError();
          }
        }

        for (const line of lines) {
          try {
            await this.stockMovementsRepository.createInboundMovementInTransaction(
              transaction,
              {
                workspaceId,
                inventoryItemId: line.inventoryItemId,
                quantity: line.quantity,
                referenceType: "PURCHASE_RECEIPT",
                referenceId: id,
                occurredAt: receivedAt,
              },
            );
          } catch (error) {
            if (error instanceof StockUpdateRejectedError) {
              throw new PurchaseReceiptStockRejectedError();
            }

            throw error;
          }
        }

        const orderLines = await transaction.purchaseOrderLine.findMany({
          where: { workspaceId, purchaseOrderId: receipt.purchaseOrderId },
          select: { id: true, quantity: true },
          orderBy: { id: "asc" },
        });
        let isComplete = orderLines.length > 0;

        for (const orderLine of orderLines) {
          const received = await this.receivedQuantity(
            transaction,
            workspaceId,
            receipt.purchaseOrderId,
            orderLine.id,
          );

          if (received.lessThan(orderLine.quantity)) {
            isComplete = false;
          }
        }

        const orderUpdated =
          await this.purchaseOrdersRepository.updateReceivingStatusInTransaction(
            transaction,
            workspaceId,
            receipt.purchaseOrderId,
            isComplete
              ? PurchaseOrderStatus.RECEIVED
              : PurchaseOrderStatus.PARTIALLY_RECEIVED,
          );

        if (!orderUpdated) {
          throw new PurchaseReceiptOrderUnavailableError();
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const receipts =
          await transaction.purchaseReceipt.updateManyAndReturn({
            where: {
              id,
              workspaceId,
              status: {
                in: [PurchaseReceiptStatus.DRAFT, PurchaseReceiptStatus.READY],
              },
            },
            data: { status: PurchaseReceiptStatus.CANCELLED },
            select: { id: true },
          });

        if (!receipts[0]) {
          return null;
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async requireDraftContext(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<ReceiptContext> {
    const receipt = await transaction.purchaseReceipt.findFirst({
      where: { id, workspaceId, status: PurchaseReceiptStatus.DRAFT },
      select: { purchaseOrderId: true, warehouseId: true },
    });

    if (!receipt) {
      throw new PurchaseReceiptStateConflictError();
    }

    const order = await transaction.purchaseOrder.findFirst({
      where: {
        id: receipt.purchaseOrderId,
        workspaceId,
        warehouseId: receipt.warehouseId,
        status: {
          in: [
            PurchaseOrderStatus.CONFIRMED,
            PurchaseOrderStatus.PARTIALLY_RECEIVED,
          ],
        },
      },
      select: { id: true },
    });

    if (!order) {
      throw new PurchaseReceiptOrderUnavailableError();
    }

    return receipt;
  }

  private async validateLineReferences(
    transaction: Prisma.TransactionClient,
    receipt: ReceiptContext,
    data: {
      workspaceId: string;
      purchaseOrderLineId: string;
      inventoryItemId: string;
    },
  ) {
    const orderLine = await transaction.purchaseOrderLine.findFirst({
      where: {
        id: data.purchaseOrderLineId,
        workspaceId: data.workspaceId,
        purchaseOrderId: receipt.purchaseOrderId,
      },
      select: { productId: true, productVariantId: true, quantity: true },
    });
    const inventoryItem = await transaction.inventoryItem.findFirst({
      where: {
        id: data.inventoryItemId,
        workspaceId: data.workspaceId,
        warehouseId: receipt.warehouseId,
        isActive: true,
      },
      select: { productId: true, productVariantId: true },
    });

    if (
      !orderLine ||
      !inventoryItem ||
      inventoryItem.productId !== orderLine.productId ||
      inventoryItem.productVariantId !== orderLine.productVariantId
    ) {
      throw new PurchaseReceiptLineReferenceError();
    }

    return orderLine;
  }

  private async validateQuantity(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    purchaseOrderId: string,
    purchaseReceiptId: string,
    purchaseOrderLineId: string,
    quantity: Prisma.Decimal,
    orderedQuantity: Prisma.Decimal,
    excludedLineId?: string,
  ): Promise<void> {
    if (quantity.lessThanOrEqualTo(0)) {
      throw new PurchaseReceiptOverQuantityError();
    }

    const previous = await this.receivedQuantity(
      transaction,
      workspaceId,
      purchaseOrderId,
      purchaseOrderLineId,
    );
    const current = await transaction.purchaseReceiptLine.aggregate({
      where: {
        workspaceId,
        purchaseReceiptId,
        purchaseOrderLineId,
        ...(excludedLineId === undefined ? {} : { id: { not: excludedLineId } }),
      },
      _sum: { quantity: true },
    });
    const currentQuantity = current._sum.quantity ?? new Prisma.Decimal(0);

    if (
      previous
        .plus(currentQuantity)
        .plus(quantity)
        .greaterThan(orderedQuantity)
    ) {
      throw new PurchaseReceiptOverQuantityError();
    }
  }

  private async receivedQuantity(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    purchaseOrderId: string,
    purchaseOrderLineId: string,
    excludedReceiptId?: string,
  ): Promise<Prisma.Decimal> {
    const received = await transaction.purchaseReceiptLine.aggregate({
      where: {
        workspaceId,
        purchaseOrderLineId,
        purchaseReceipt: {
          purchaseOrderId,
          status: PurchaseReceiptStatus.RECEIVED,
          ...(excludedReceiptId === undefined
            ? {}
            : { id: { not: excludedReceiptId } }),
        },
      },
      _sum: { quantity: true },
    });

    return received._sum.quantity ?? new Prisma.Decimal(0);
  }

  private findByIdOrThrow(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines> {
    return transaction.purchaseReceipt.findUniqueOrThrow({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  private readonly lineOrder = [
    { createdAt: "asc" as const },
    { id: "asc" as const },
  ];
}
