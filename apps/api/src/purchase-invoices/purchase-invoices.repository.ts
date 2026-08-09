import { Injectable } from "@nestjs/common";
import { Prisma, PurchaseInvoiceStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type PurchaseInvoiceRecord = Prisma.PurchaseInvoiceGetPayload<object>;
export type PurchaseInvoiceWithLines = Prisma.PurchaseInvoiceGetPayload<{
  include: { lines: true };
}>;
export type PurchaseInvoiceSupplier =
  Prisma.BusinessPartnerGetPayload<object>;
export type PurchaseInvoiceOrder = Prisma.PurchaseOrderGetPayload<object>;
export type PurchaseInvoiceOrderLine =
  Prisma.PurchaseOrderLineGetPayload<object>;
export type PurchaseInvoiceProduct = Prisma.ProductGetPayload<object>;
export type PurchaseInvoiceProductVariant =
  Prisma.ProductVariantGetPayload<object>;

export interface PurchaseInvoiceLineInput {
  workspaceId: string;
  purchaseOrderLineId?: string;
  productId?: string;
  productVariantId?: string;
  description: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  subtotalAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

export interface CreatePurchaseInvoiceData {
  workspaceId: string;
  number: string;
  supplierInvoiceNumber: string;
  supplierId: string;
  purchaseOrderId?: string;
  currencyCode: string;
  invoiceDate: Date;
  dueDate?: Date;
  notes?: string;
  lines: PurchaseInvoiceLineInput[];
}

export interface UpdatePurchaseInvoiceData {
  number?: string;
  supplierInvoiceNumber?: string;
  supplierId?: string;
  purchaseOrderId?: string;
  currencyCode?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  notes?: string;
  lines?: PurchaseInvoiceLineInput[];
}

export interface PurchaseInvoiceSearchCriteria {
  supplierId?: string;
  status?: PurchaseInvoiceStatus;
  invoiceDateFrom?: Date;
  invoiceDateTo?: Date;
}

export class PurchaseInvoiceStateConflictError extends Error {
  constructor() {
    super("Purchase invoice state changed concurrently");
    this.name = "PurchaseInvoiceStateConflictError";
  }
}

export class PurchaseInvoiceDuplicateSupplierNumberError extends Error {
  constructor() {
    super("Supplier invoice number already exists for this supplier");
    this.name = "PurchaseInvoiceDuplicateSupplierNumberError";
  }
}

@Injectable()
export class PurchaseInvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePurchaseInvoiceData): Promise<PurchaseInvoiceWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.rejectDuplicateSupplierNumber(
          transaction,
          data.workspaceId,
          data.supplierId,
          data.supplierInvoiceNumber,
        );
        const { lines, ...header } = data;
        const totals = this.sumAmounts(lines);

        return transaction.purchaseInvoice.create({
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

  update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseInvoiceData,
  ): Promise<PurchaseInvoiceWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const current = await transaction.purchaseInvoice.findFirst({
          where: { id, workspaceId, status: PurchaseInvoiceStatus.DRAFT },
          select: { supplierId: true, supplierInvoiceNumber: true },
        });

        if (!current) {
          throw new PurchaseInvoiceStateConflictError();
        }

        await this.rejectDuplicateSupplierNumber(
          transaction,
          workspaceId,
          data.supplierId ?? current.supplierId,
          data.supplierInvoiceNumber ?? current.supplierInvoiceNumber,
          id,
        );
        const { lines, ...header } = data;
        const invoices =
          await transaction.purchaseInvoice.updateManyAndReturn({
            where: { id, workspaceId, status: PurchaseInvoiceStatus.DRAFT },
            data: {
              ...header,
              ...(lines === undefined ? {} : this.sumAmounts(lines)),
            },
            select: { id: true },
          });

        if (!invoices[0]) {
          throw new PurchaseInvoiceStateConflictError();
        }

        if (lines !== undefined) {
          await transaction.purchaseInvoiceLine.deleteMany({
            where: { workspaceId, purchaseInvoiceId: id },
          });

          if (lines.length > 0) {
            await transaction.purchaseInvoiceLine.createMany({
              data: lines.map((line) => ({ ...line, purchaseInvoiceId: id })),
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
  ): Promise<PurchaseInvoiceWithLines | null> {
    return this.prisma.purchaseInvoice.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(
    workspaceId: string,
    criteria: PurchaseInvoiceSearchCriteria,
  ): Promise<PurchaseInvoiceRecord[]> {
    return this.prisma.purchaseInvoice.findMany({
      where: {
        workspaceId,
        ...(criteria.supplierId === undefined
          ? {}
          : { supplierId: criteria.supplierId }),
        ...(criteria.status === undefined ? {} : { status: criteria.status }),
        ...(criteria.invoiceDateFrom === undefined &&
        criteria.invoiceDateTo === undefined
          ? {}
          : {
              invoiceDate: {
                ...(criteria.invoiceDateFrom === undefined
                  ? {}
                  : { gte: criteria.invoiceDateFrom }),
                ...(criteria.invoiceDateTo === undefined
                  ? {}
                  : { lte: criteria.invoiceDateTo }),
              },
            }),
      },
      orderBy: [{ invoiceDate: "desc" }, { number: "asc" }],
    });
  }

  confirm(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [PurchaseInvoiceStatus.DRAFT],
      PurchaseInvoiceStatus.CONFIRMED,
      true,
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceWithLines | null> {
    return this.transitionStatus(
      workspaceId,
      id,
      [PurchaseInvoiceStatus.DRAFT, PurchaseInvoiceStatus.CONFIRMED],
      PurchaseInvoiceStatus.CANCELLED,
    );
  }

  findSupplier(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceSupplier | null> {
    return this.prisma.businessPartner.findFirst({
      where: { id, workspaceId },
    });
  }

  findPurchaseOrder(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceOrder | null> {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, workspaceId },
    });
  }

  findPurchaseOrderLine(
    workspaceId: string,
    id: string,
    purchaseOrderId: string,
  ): Promise<PurchaseInvoiceOrderLine | null> {
    return this.prisma.purchaseOrderLine.findFirst({
      where: { id, workspaceId, purchaseOrderId },
    });
  }

  findProduct(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceProduct | null> {
    return this.prisma.product.findFirst({ where: { id, workspaceId } });
  }

  findProductVariant(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceProductVariant | null> {
    return this.prisma.productVariant.findFirst({
      where: { id, workspaceId },
    });
  }

  findPayableInTransaction(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
    currencyCode: string,
  ): Promise<PurchaseInvoiceRecord | null> {
    return transaction.purchaseInvoice.findFirst({
      where: {
        id,
        workspaceId,
        currencyCode,
        status: {
          in: [
            PurchaseInvoiceStatus.CONFIRMED,
            PurchaseInvoiceStatus.PARTIALLY_PAID,
          ],
        },
      },
    });
  }

  async updatePaymentStatusInTransaction(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
    expectedPaidAmount: Prisma.Decimal,
    expectedStatus: PurchaseInvoiceStatus,
    paidAmount: Prisma.Decimal,
    status: PurchaseInvoiceStatus,
  ): Promise<boolean> {
    const invoices = await transaction.purchaseInvoice.updateManyAndReturn({
      where: {
        id,
        workspaceId,
        paidAmount: expectedPaidAmount,
        status: expectedStatus,
      },
      data: { paidAmount, status },
      select: { id: true },
    });

    return invoices.length === 1;
  }

  private transitionStatus(
    workspaceId: string,
    id: string,
    fromStatuses: PurchaseInvoiceStatus[],
    toStatus: PurchaseInvoiceStatus,
    requireLines = false,
  ): Promise<PurchaseInvoiceWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const confirmedAt = new Date();
        const invoices =
          await transaction.purchaseInvoice.updateManyAndReturn({
            where: {
              id,
              workspaceId,
              status: { in: fromStatuses },
              ...(requireLines ? { lines: { some: {} } } : {}),
            },
            data: {
              status: toStatus,
              ...(toStatus === PurchaseInvoiceStatus.CONFIRMED
                ? { confirmedAt }
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

  private async rejectDuplicateSupplierNumber(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    supplierId: string,
    supplierInvoiceNumber: string,
    excludedId?: string,
  ): Promise<void> {
    const duplicate = await transaction.purchaseInvoice.findFirst({
      where: {
        workspaceId,
        supplierId,
        supplierInvoiceNumber,
        ...(excludedId === undefined ? {} : { id: { not: excludedId } }),
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new PurchaseInvoiceDuplicateSupplierNumberError();
    }
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
  ): Promise<PurchaseInvoiceWithLines> {
    return transaction.purchaseInvoice.findUniqueOrThrow({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  private readonly lineOrder = [
    { createdAt: "asc" as const },
    { id: "asc" as const },
  ];
}
