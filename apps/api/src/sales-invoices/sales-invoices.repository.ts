import { Injectable } from "@nestjs/common";
import { Prisma, SalesInvoiceStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type SalesInvoiceRecord = Prisma.SalesInvoiceGetPayload<object>;
export type SalesInvoiceWithLines = Prisma.SalesInvoiceGetPayload<{
  include: { lines: true };
}>;
export type InvoiceBusinessPartner = Prisma.BusinessPartnerGetPayload<object>;
export type InvoiceProduct = Prisma.ProductGetPayload<object>;
export type InvoiceProductVariant = Prisma.ProductVariantGetPayload<object>;
export type InvoiceSalesOrderLine = Prisma.SalesOrderLineGetPayload<object>;

export interface SalesInvoiceLineInput {
  workspaceId: string;
  salesOrderLineId?: string;
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

export interface CreateSalesInvoiceData {
  workspaceId: string;
  number: string;
  businessPartnerId: string;
  issueDate: Date;
  dueDate?: Date;
  currencyCode: string;
  notes?: string;
  lines: SalesInvoiceLineInput[];
}

export interface ConvertSalesOrderToInvoiceData {
  number: string;
  issueDate: Date;
  dueDate?: Date;
}

export interface UpdateSalesInvoiceData {
  number?: string;
  businessPartnerId?: string;
  issueDate?: Date;
  dueDate?: Date;
  currencyCode?: string;
  notes?: string;
  lines?: SalesInvoiceLineInput[];
}

export class SalesInvoiceStateConflictError extends Error {
  constructor() {
    super("Sales invoice state changed concurrently");
    this.name = "SalesInvoiceStateConflictError";
  }
}

export class SalesInvoiceSourceOrderNotFoundError extends Error {
  constructor() {
    super("Source sales order was not found");
    this.name = "SalesInvoiceSourceOrderNotFoundError";
  }
}

export class SalesInvoiceOrderAlreadyInvoicedError extends Error {
  constructor() {
    super("Source sales order was already invoiced");
    this.name = "SalesInvoiceOrderAlreadyInvoicedError";
  }
}

@Injectable()
export class SalesInvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSalesInvoiceData): Promise<SalesInvoiceWithLines> {
    return this.prisma.$transaction(
      (transaction) => {
        const { lines, ...header } = data;
        const totals = this.sumAmounts(lines);

        return transaction.salesInvoice.create({
          data: {
            ...header,
            ...totals,
            lines: { create: lines },
          },
          include: { lines: { orderBy: this.lineOrder } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  createFromOrder(
    workspaceId: string,
    salesOrderId: string,
    data: ConvertSalesOrderToInvoiceData,
  ): Promise<SalesInvoiceWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const order = await transaction.salesOrder.findFirst({
          where: { id: salesOrderId, workspaceId },
          include: { lines: { orderBy: this.lineOrder } },
        });

        if (!order) {
          throw new SalesInvoiceSourceOrderNotFoundError();
        }

        const existingInvoice = await transaction.salesInvoice.findFirst({
          where: { workspaceId, salesOrderId },
          select: { id: true },
        });

        if (existingInvoice) {
          throw new SalesInvoiceOrderAlreadyInvoicedError();
        }

        const lines = order.lines.map((line) => {
          const amounts = this.calculateAmounts(
            line.quantity,
            line.unitPrice,
            line.taxRate,
          );

          return {
            workspaceId,
            salesOrderLineId: line.id,
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

        return transaction.salesInvoice.create({
          data: {
            workspaceId,
            number: data.number,
            businessPartnerId: order.businessPartnerId,
            salesOrderId,
            issueDate: data.issueDate,
            ...(data.dueDate === undefined ? {} : { dueDate: data.dueDate }),
            currencyCode: order.currencyCode,
            ...(order.notes === null ? {} : { notes: order.notes }),
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
    data: UpdateSalesInvoiceData,
  ): Promise<SalesInvoiceWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const { lines, ...header } = data;
        const invoices = await transaction.salesInvoice.updateManyAndReturn({
          where: { id, workspaceId, status: SalesInvoiceStatus.DRAFT },
          data: {
            ...header,
            ...(lines === undefined ? {} : this.sumAmounts(lines)),
          },
          select: { id: true },
        });

        if (!invoices[0]) {
          throw new SalesInvoiceStateConflictError();
        }

        if (lines !== undefined) {
          await transaction.salesInvoiceLine.deleteMany({
            where: { workspaceId, salesInvoiceId: id },
          });

          if (lines.length > 0) {
            await transaction.salesInvoiceLine.createMany({
              data: lines.map((line) => ({ ...line, salesInvoiceId: id })),
            });
          }
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines | null> {
    return this.prisma.salesInvoice.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<SalesInvoiceRecord[]> {
    return this.prisma.salesInvoice.findMany({
      where: { workspaceId },
      orderBy: [{ issueDate: "desc" }, { number: "asc" }],
    });
  }

  issue(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [SalesInvoiceStatus.DRAFT],
      SalesInvoiceStatus.ISSUED,
      true,
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [
        SalesInvoiceStatus.DRAFT,
        SalesInvoiceStatus.ISSUED,
        SalesInvoiceStatus.PARTIALLY_PAID,
        SalesInvoiceStatus.OVERDUE,
      ],
      SalesInvoiceStatus.CANCELLED,
    );
  }

  findBusinessPartner(
    workspaceId: string,
    id: string,
  ): Promise<InvoiceBusinessPartner | null> {
    return this.prisma.businessPartner.findFirst({
      where: { id, workspaceId },
    });
  }

  findProduct(workspaceId: string, id: string): Promise<InvoiceProduct | null> {
    return this.prisma.product.findFirst({
      where: { id, workspaceId },
    });
  }

  findProductVariant(
    workspaceId: string,
    id: string,
  ): Promise<InvoiceProductVariant | null> {
    return this.prisma.productVariant.findFirst({
      where: { id, workspaceId },
    });
  }

  findSalesOrderLine(
    workspaceId: string,
    id: string,
  ): Promise<InvoiceSalesOrderLine | null> {
    return this.prisma.salesOrderLine.findFirst({
      where: { id, workspaceId },
    });
  }

  private transitionStatus(
    workspaceId: string,
    id: string,
    fromStatuses: SalesInvoiceStatus[],
    toStatus: SalesInvoiceStatus,
    requireLines = false,
  ): Promise<SalesInvoiceWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const transitionedAt = new Date();
        const invoices =
          await transaction.salesInvoice.updateManyAndReturn({
            where: {
              id,
              workspaceId,
              status: { in: fromStatuses },
              ...(requireLines ? { lines: { some: {} } } : {}),
            },
            data: {
              status: toStatus,
              ...(toStatus === SalesInvoiceStatus.ISSUED
                ? { issuedAt: transitionedAt }
                : {}),
              ...(toStatus === SalesInvoiceStatus.CANCELLED
                ? { cancelledAt: transitionedAt }
                : {}),
            },
            select: { id: true },
          });

        if (!invoices[0]) {
          return null;
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
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
  ): Promise<SalesInvoiceWithLines> {
    return transaction.salesInvoice.findUniqueOrThrow({
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
