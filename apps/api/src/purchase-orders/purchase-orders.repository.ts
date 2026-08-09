import { Injectable } from "@nestjs/common";
import { Prisma, PurchaseOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type PurchaseOrderRecord = Prisma.PurchaseOrderGetPayload<object>;
export type PurchaseOrderWithLines = Prisma.PurchaseOrderGetPayload<{
  include: { lines: true };
}>;
export type PurchaseOrderSupplier = Prisma.BusinessPartnerGetPayload<{
  include: {
    roleAssignments: {
      include: { businessPartnerRole: true };
    };
  };
}>;
export type PurchaseOrderWarehouse = Prisma.WarehouseGetPayload<object>;
export type PurchaseOrderProduct = Prisma.ProductGetPayload<object>;
export type PurchaseOrderProductVariant =
  Prisma.ProductVariantGetPayload<object>;

export interface CreatePurchaseOrderData {
  workspaceId: string;
  number: string;
  supplierId: string;
  warehouseId: string;
  orderDate: Date;
  expectedDate?: Date;
  currencyCode: string;
  supplierReference?: string;
  notes?: string;
}

export interface UpdatePurchaseOrderData {
  number?: string;
  supplierId?: string;
  warehouseId?: string;
  orderDate?: Date;
  expectedDate?: Date;
  currencyCode?: string;
  supplierReference?: string;
  notes?: string;
}

export interface PurchaseOrderLineData {
  workspaceId: string;
  purchaseOrderId: string;
  productId: string;
  productVariantId?: string;
  description: string;
  quantity: Prisma.Decimal;
  unitCost: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  subtotalAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  sortOrder: number;
}

export type UpdatePurchaseOrderLineData = Omit<
  PurchaseOrderLineData,
  "workspaceId" | "purchaseOrderId"
>;

export class PurchaseOrderStateConflictError extends Error {
  constructor() {
    super("Purchase order state changed concurrently");
    this.name = "PurchaseOrderStateConflictError";
  }
}

export class PurchaseOrderLineNotFoundError extends Error {
  constructor() {
    super("Purchase order line was not found");
    this.name = "PurchaseOrderLineNotFoundError";
  }
}

@Injectable()
export class PurchaseOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePurchaseOrderData): Promise<PurchaseOrderWithLines> {
    return this.prisma.purchaseOrder.create({
      data,
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseOrderData,
  ): Promise<PurchaseOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const orders = await transaction.purchaseOrder.updateManyAndReturn({
          where: { id, workspaceId, status: PurchaseOrderStatus.DRAFT },
          data,
          select: { id: true },
        });

        if (!orders[0]) {
          throw new PurchaseOrderStateConflictError();
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines | null> {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<PurchaseOrderRecord[]> {
    return this.prisma.purchaseOrder.findMany({
      where: { workspaceId },
      orderBy: [{ orderDate: "desc" }, { number: "asc" }],
    });
  }

  addLine(data: PurchaseOrderLineData): Promise<PurchaseOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftOrder(
          transaction,
          data.workspaceId,
          data.purchaseOrderId,
        );
        await transaction.purchaseOrderLine.create({ data });
        return this.recalculateTotals(
          transaction,
          data.workspaceId,
          data.purchaseOrderId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  updateLine(
    workspaceId: string,
    purchaseOrderId: string,
    lineId: string,
    data: UpdatePurchaseOrderLineData,
  ): Promise<PurchaseOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftOrder(transaction, workspaceId, purchaseOrderId);
        const lines =
          await transaction.purchaseOrderLine.updateManyAndReturn({
            where: { id: lineId, workspaceId, purchaseOrderId },
            data: {
              ...data,
              productVariantId: data.productVariantId ?? null,
            },
            select: { id: true },
          });

        if (!lines[0]) {
          throw new PurchaseOrderLineNotFoundError();
        }

        return this.recalculateTotals(
          transaction,
          workspaceId,
          purchaseOrderId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  removeLine(
    workspaceId: string,
    purchaseOrderId: string,
    lineId: string,
  ): Promise<PurchaseOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftOrder(transaction, workspaceId, purchaseOrderId);
        const deleted = await transaction.purchaseOrderLine.deleteMany({
          where: { id: lineId, workspaceId, purchaseOrderId },
        });

        if (deleted.count !== 1) {
          throw new PurchaseOrderLineNotFoundError();
        }

        return this.recalculateTotals(
          transaction,
          workspaceId,
          purchaseOrderId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  transitionStatus(
    workspaceId: string,
    id: string,
    fromStatuses: PurchaseOrderStatus[],
    toStatus: PurchaseOrderStatus,
    requireLines = false,
  ): Promise<PurchaseOrderWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const transitionedAt = new Date();
        const orders = await transaction.purchaseOrder.updateManyAndReturn({
          where: {
            id,
            workspaceId,
            status: { in: fromStatuses },
            ...(requireLines ? { lines: { some: {} } } : {}),
          },
          data: {
            status: toStatus,
            ...(toStatus === PurchaseOrderStatus.SENT
              ? { sentAt: transitionedAt }
              : {}),
            ...(toStatus === PurchaseOrderStatus.CONFIRMED
              ? { confirmedAt: transitionedAt }
              : {}),
            ...(toStatus === PurchaseOrderStatus.CANCELLED
              ? { cancelledAt: transitionedAt }
              : {}),
          },
          select: { id: true },
        });

        if (!orders[0]) {
          return null;
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findSupplier(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderSupplier | null> {
    return this.prisma.businessPartner.findFirst({
      where: { id, workspaceId },
      include: {
        roleAssignments: {
          where: {
            workspaceId,
            businessPartnerRole: {
              workspaceId,
              code: "SUPPLIER",
              isActive: true,
            },
          },
          include: { businessPartnerRole: true },
        },
      },
    });
  }

  findWarehouse(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWarehouse | null> {
    return this.prisma.warehouse.findFirst({ where: { id, workspaceId } });
  }

  findProduct(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderProduct | null> {
    return this.prisma.product.findFirst({ where: { id, workspaceId } });
  }

  findProductVariant(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderProductVariant | null> {
    return this.prisma.productVariant.findFirst({
      where: { id, workspaceId },
    });
  }

  async updateReceivingStatusInTransaction(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
    status: PurchaseOrderStatus,
  ): Promise<boolean> {
    const orders = await transaction.purchaseOrder.updateMany({
      where: {
        id,
        workspaceId,
        status: {
          in: [
            PurchaseOrderStatus.CONFIRMED,
            PurchaseOrderStatus.PARTIALLY_RECEIVED,
          ],
        },
      },
      data: { status },
    });

    return orders.count === 1;
  }

  private async claimDraftOrder(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const claimed = await transaction.purchaseOrder.updateMany({
      where: { id, workspaceId, status: PurchaseOrderStatus.DRAFT },
      data: { updatedAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new PurchaseOrderStateConflictError();
    }
  }

  private async recalculateTotals(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines> {
    const lines = await transaction.purchaseOrderLine.findMany({
      where: { workspaceId, purchaseOrderId: id },
      select: {
        subtotalAmount: true,
        taxAmount: true,
        totalAmount: true,
      },
    });
    const totals = this.sumAmounts(lines);

    await transaction.purchaseOrder.update({
      where: { id, workspaceId },
      data: totals,
    });

    return this.findByIdOrThrow(transaction, workspaceId, id);
  }

  private sumAmounts(
    lines: Array<{
      subtotalAmount: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      totalAmount: Prisma.Decimal;
    }>,
  ) {
    const zero = new Prisma.Decimal(0);

    return {
      subtotalAmount: lines.reduce(
        (total, line) => total.plus(line.subtotalAmount),
        zero,
      ),
      taxAmount: lines.reduce(
        (total, line) => total.plus(line.taxAmount),
        zero,
      ),
      totalAmount: lines.reduce(
        (total, line) => total.plus(line.totalAmount),
        zero,
      ),
    };
  }

  private findByIdOrThrow(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines> {
    return transaction.purchaseOrder.findUniqueOrThrow({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  private readonly lineOrder = [
    { sortOrder: "asc" as const },
    { createdAt: "asc" as const },
    { id: "asc" as const },
  ];
}
