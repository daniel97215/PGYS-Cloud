import { Injectable } from "@nestjs/common";
import {
  Prisma,
  SalesOrderStatus,
  SalesQuoteStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type SalesOrderRecord = Prisma.SalesOrderGetPayload<object>;
export type SalesOrderWithLines = Prisma.SalesOrderGetPayload<{
  include: { lines: true };
}>;
export type OrderBusinessPartner = Prisma.BusinessPartnerGetPayload<object>;
export type OrderProduct = Prisma.ProductGetPayload<object>;
export type OrderProductVariant = Prisma.ProductVariantGetPayload<object>;

export interface CreateSalesOrderData {
  workspaceId: string;
  number: string;
  businessPartnerId: string;
  orderDate: Date;
  requestedDate?: Date;
  currencyCode: string;
  notes?: string;
}

export interface ConvertSalesQuoteData {
  number: string;
  orderDate: Date;
  requestedDate?: Date;
}

export interface UpdateSalesOrderData {
  number?: string;
  businessPartnerId?: string;
  orderDate?: Date;
  requestedDate?: Date;
  currencyCode?: string;
  notes?: string;
}

export interface SalesOrderLineData {
  workspaceId: string;
  salesOrderId: string;
  productId: string;
  productVariantId?: string;
  description: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  subtotalAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  sortOrder: number;
}

export type UpdateSalesOrderLineData = Omit<
  SalesOrderLineData,
  "workspaceId" | "salesOrderId"
>;

export class SalesOrderStateConflictError extends Error {
  constructor() {
    super("Sales order state changed concurrently");
    this.name = "SalesOrderStateConflictError";
  }
}

export class SalesOrderLineNotFoundError extends Error {
  constructor() {
    super("Sales order line was not found");
    this.name = "SalesOrderLineNotFoundError";
  }
}

export class SalesOrderSourceQuoteNotFoundError extends Error {
  constructor() {
    super("Source sales quote was not found");
    this.name = "SalesOrderSourceQuoteNotFoundError";
  }
}

export class SalesOrderQuoteNotAcceptedError extends Error {
  constructor() {
    super("Source sales quote is not accepted");
    this.name = "SalesOrderQuoteNotAcceptedError";
  }
}

export class SalesOrderQuoteAlreadyConvertedError extends Error {
  constructor() {
    super("Source sales quote was already converted");
    this.name = "SalesOrderQuoteAlreadyConvertedError";
  }
}

@Injectable()
export class SalesOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSalesOrderData): Promise<SalesOrderWithLines> {
    return this.prisma.salesOrder.create({
      data,
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  createFromQuote(
    workspaceId: string,
    salesQuoteId: string,
    data: ConvertSalesQuoteData,
  ): Promise<SalesOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const quote = await transaction.salesQuote.findFirst({
          where: { id: salesQuoteId, workspaceId },
          include: { lines: { orderBy: this.lineOrder } },
        });

        if (!quote) {
          throw new SalesOrderSourceQuoteNotFoundError();
        }

        if (quote.status !== SalesQuoteStatus.ACCEPTED) {
          throw new SalesOrderQuoteNotAcceptedError();
        }

        const existingOrder = await transaction.salesOrder.findFirst({
          where: { workspaceId, salesQuoteId },
          select: { id: true },
        });

        if (existingOrder) {
          throw new SalesOrderQuoteAlreadyConvertedError();
        }

        const lines = quote.lines.map((line) => {
          const amounts = this.calculateAmounts(
            line.quantity,
            line.unitPrice,
            line.taxRate,
          );

          return {
            workspaceId,
            productId: line.productId,
            productVariantId: line.productVariantId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            ...amounts,
            sortOrder: line.sortOrder,
          };
        });
        const totals = this.sumAmounts(lines);

        return transaction.salesOrder.create({
          data: {
            workspaceId,
            number: data.number,
            businessPartnerId: quote.businessPartnerId,
            salesQuoteId,
            orderDate: data.orderDate,
            ...(data.requestedDate === undefined
              ? {}
              : { requestedDate: data.requestedDate }),
            currencyCode: quote.currencyCode,
            ...(quote.notes === null ? {} : { notes: quote.notes }),
            ...totals,
            lines: { create: lines },
          },
          include: { lines: { orderBy: this.lineOrder } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdateSalesOrderData,
  ): Promise<SalesOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const orders = await transaction.salesOrder.updateManyAndReturn({
          where: { id, workspaceId, status: SalesOrderStatus.DRAFT },
          data,
          select: { id: true },
        });

        if (!orders[0]) {
          throw new SalesOrderStateConflictError();
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<SalesOrderWithLines | null> {
    return this.prisma.salesOrder.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<SalesOrderRecord[]> {
    return this.prisma.salesOrder.findMany({
      where: { workspaceId },
      orderBy: [{ orderDate: "desc" }, { number: "asc" }],
    });
  }

  addLine(data: SalesOrderLineData): Promise<SalesOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftOrder(
          transaction,
          data.workspaceId,
          data.salesOrderId,
        );
        await transaction.salesOrderLine.create({ data });
        return this.recalculateTotals(
          transaction,
          data.workspaceId,
          data.salesOrderId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  updateLine(
    workspaceId: string,
    salesOrderId: string,
    lineId: string,
    data: UpdateSalesOrderLineData,
  ): Promise<SalesOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftOrder(transaction, workspaceId, salesOrderId);
        const lines = await transaction.salesOrderLine.updateManyAndReturn({
          where: { id: lineId, workspaceId, salesOrderId },
          data: {
            ...data,
            productVariantId: data.productVariantId ?? null,
          },
          select: { id: true },
        });

        if (!lines[0]) {
          throw new SalesOrderLineNotFoundError();
        }

        return this.recalculateTotals(
          transaction,
          workspaceId,
          salesOrderId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  removeLine(
    workspaceId: string,
    salesOrderId: string,
    lineId: string,
  ): Promise<SalesOrderWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftOrder(transaction, workspaceId, salesOrderId);
        const deleted = await transaction.salesOrderLine.deleteMany({
          where: { id: lineId, workspaceId, salesOrderId },
        });

        if (deleted.count !== 1) {
          throw new SalesOrderLineNotFoundError();
        }

        return this.recalculateTotals(
          transaction,
          workspaceId,
          salesOrderId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async transitionStatus(
    workspaceId: string,
    id: string,
    fromStatuses: SalesOrderStatus[],
    toStatus: SalesOrderStatus,
    requireLines = false,
  ): Promise<SalesOrderWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const transitionedAt = new Date();
        const orders = await transaction.salesOrder.updateManyAndReturn({
          where: {
            id,
            workspaceId,
            status: { in: fromStatuses },
            ...(requireLines ? { lines: { some: {} } } : {}),
          },
          data: {
            status: toStatus,
            ...(toStatus === SalesOrderStatus.CONFIRMED
              ? { confirmedAt: transitionedAt }
              : {}),
            ...(toStatus === SalesOrderStatus.COMPLETED
              ? { completedAt: transitionedAt }
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

  findBusinessPartner(
    workspaceId: string,
    id: string,
  ): Promise<OrderBusinessPartner | null> {
    return this.prisma.businessPartner.findFirst({
      where: { id, workspaceId },
    });
  }

  findProduct(workspaceId: string, id: string): Promise<OrderProduct | null> {
    return this.prisma.product.findFirst({
      where: { id, workspaceId },
    });
  }

  findProductVariant(
    workspaceId: string,
    id: string,
  ): Promise<OrderProductVariant | null> {
    return this.prisma.productVariant.findFirst({
      where: { id, workspaceId },
    });
  }

  private async claimDraftOrder(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const claimed = await transaction.salesOrder.updateMany({
      where: { id, workspaceId, status: SalesOrderStatus.DRAFT },
      data: { updatedAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new SalesOrderStateConflictError();
    }
  }

  private async recalculateTotals(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<SalesOrderWithLines> {
    const lines = await transaction.salesOrderLine.findMany({
      where: { workspaceId, salesOrderId: id },
      select: {
        subtotalAmount: true,
        taxAmount: true,
        totalAmount: true,
      },
    });
    const totals = this.sumAmounts(lines);

    await transaction.salesOrder.update({
      where: { id, workspaceId },
      data: totals,
    });

    return this.findByIdOrThrow(transaction, workspaceId, id);
  }

  private calculateAmounts(
    quantity: Prisma.Decimal,
    unitPrice: Prisma.Decimal,
    taxRate: Prisma.Decimal,
  ) {
    const subtotalAmount = quantity.mul(unitPrice).toDecimalPlaces(4);
    const taxAmount = subtotalAmount
      .mul(taxRate)
      .div(100)
      .toDecimalPlaces(4);

    return {
      subtotalAmount,
      taxAmount,
      totalAmount: subtotalAmount.plus(taxAmount).toDecimalPlaces(4),
    };
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
  ): Promise<SalesOrderWithLines> {
    return transaction.salesOrder.findUniqueOrThrow({
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
