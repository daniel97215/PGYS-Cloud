import { Injectable } from "@nestjs/common";
import { Prisma, SalesQuoteStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type SalesQuoteRecord = Prisma.SalesQuoteGetPayload<object>;
export type SalesQuoteWithLines = Prisma.SalesQuoteGetPayload<{
  include: { lines: true };
}>;
export type SalesQuoteLineRecord = Prisma.SalesQuoteLineGetPayload<object>;
export type QuoteBusinessPartner = Prisma.BusinessPartnerGetPayload<object>;
export type QuoteProduct = Prisma.ProductGetPayload<object>;
export type QuoteProductVariant = Prisma.ProductVariantGetPayload<object>;

export interface CreateSalesQuoteData {
  workspaceId: string;
  number: string;
  businessPartnerId: string;
  issueDate: Date;
  validUntil?: Date;
  currencyCode: string;
  notes?: string;
}

export interface UpdateSalesQuoteData {
  number?: string;
  businessPartnerId?: string;
  issueDate?: Date;
  validUntil?: Date;
  currencyCode?: string;
  notes?: string;
}

export interface SalesQuoteLineData {
  workspaceId: string;
  salesQuoteId: string;
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

export type UpdateSalesQuoteLineData = Omit<
  SalesQuoteLineData,
  "workspaceId" | "salesQuoteId"
>;

export class SalesQuoteStateConflictError extends Error {
  constructor() {
    super("Sales quote state changed concurrently");
    this.name = "SalesQuoteStateConflictError";
  }
}

export class SalesQuoteLineNotFoundError extends Error {
  constructor() {
    super("Sales quote line was not found");
    this.name = "SalesQuoteLineNotFoundError";
  }
}

@Injectable()
export class SalesQuotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSalesQuoteData): Promise<SalesQuoteWithLines> {
    return this.prisma.salesQuote.create({
      data,
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdateSalesQuoteData,
  ): Promise<SalesQuoteWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const quotes = await transaction.salesQuote.updateManyAndReturn({
          where: { id, workspaceId, status: SalesQuoteStatus.DRAFT },
          data,
          select: { id: true },
        });

        if (!quotes[0]) {
          throw new SalesQuoteStateConflictError();
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<SalesQuoteWithLines | null> {
    return this.prisma.salesQuote.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<SalesQuoteRecord[]> {
    return this.prisma.salesQuote.findMany({
      where: { workspaceId },
      orderBy: [{ issueDate: "desc" }, { number: "asc" }],
    });
  }

  addLine(
    data: SalesQuoteLineData,
  ): Promise<SalesQuoteWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftQuote(
          transaction,
          data.workspaceId,
          data.salesQuoteId,
        );
        await transaction.salesQuoteLine.create({ data });
        return this.recalculateTotals(
          transaction,
          data.workspaceId,
          data.salesQuoteId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  updateLine(
    workspaceId: string,
    salesQuoteId: string,
    lineId: string,
    data: UpdateSalesQuoteLineData,
  ): Promise<SalesQuoteWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftQuote(transaction, workspaceId, salesQuoteId);
        const lines = await transaction.salesQuoteLine.updateManyAndReturn({
          where: { id: lineId, workspaceId, salesQuoteId },
          data: {
            ...data,
            productVariantId: data.productVariantId ?? null,
          },
          select: { id: true },
        });

        if (!lines[0]) {
          throw new SalesQuoteLineNotFoundError();
        }

        return this.recalculateTotals(
          transaction,
          workspaceId,
          salesQuoteId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  removeLine(
    workspaceId: string,
    salesQuoteId: string,
    lineId: string,
  ): Promise<SalesQuoteWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftQuote(transaction, workspaceId, salesQuoteId);
        const deleted = await transaction.salesQuoteLine.deleteMany({
          where: { id: lineId, workspaceId, salesQuoteId },
        });

        if (deleted.count !== 1) {
          throw new SalesQuoteLineNotFoundError();
        }

        return this.recalculateTotals(
          transaction,
          workspaceId,
          salesQuoteId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async transitionStatus(
    workspaceId: string,
    id: string,
    fromStatuses: SalesQuoteStatus[],
    toStatus: SalesQuoteStatus,
  ): Promise<SalesQuoteWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const quotes = await transaction.salesQuote.updateManyAndReturn({
          where: { id, workspaceId, status: { in: fromStatuses } },
          data: { status: toStatus },
          select: { id: true },
        });

        if (!quotes[0]) {
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
  ): Promise<QuoteBusinessPartner | null> {
    return this.prisma.businessPartner.findFirst({
      where: { id, workspaceId },
    });
  }

  findProduct(workspaceId: string, id: string): Promise<QuoteProduct | null> {
    return this.prisma.product.findFirst({
      where: { id, workspaceId },
    });
  }

  findProductVariant(
    workspaceId: string,
    id: string,
  ): Promise<QuoteProductVariant | null> {
    return this.prisma.productVariant.findFirst({
      where: { id, workspaceId },
    });
  }

  private async claimDraftQuote(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const claimed = await transaction.salesQuote.updateMany({
      where: { id, workspaceId, status: SalesQuoteStatus.DRAFT },
      data: { updatedAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new SalesQuoteStateConflictError();
    }
  }

  private async recalculateTotals(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<SalesQuoteWithLines> {
    const lines = await transaction.salesQuoteLine.findMany({
      where: { workspaceId, salesQuoteId: id },
      select: {
        subtotalAmount: true,
        taxAmount: true,
        totalAmount: true,
      },
    });
    const zero = new Prisma.Decimal(0);
    const subtotalAmount = lines.reduce(
      (total, line) => total.plus(line.subtotalAmount),
      zero,
    );
    const taxAmount = lines.reduce(
      (total, line) => total.plus(line.taxAmount),
      zero,
    );
    const totalAmount = lines.reduce(
      (total, line) => total.plus(line.totalAmount),
      zero,
    );

    await transaction.salesQuote.update({
      where: { id, workspaceId },
      data: { subtotalAmount, taxAmount, totalAmount },
    });

    return this.findByIdOrThrow(transaction, workspaceId, id);
  }

  private findByIdOrThrow(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<SalesQuoteWithLines> {
    return transaction.salesQuote.findUniqueOrThrow({
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
