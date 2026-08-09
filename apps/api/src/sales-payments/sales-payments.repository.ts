import { Injectable } from "@nestjs/common";
import {
  Prisma,
  SalesInvoiceStatus,
  SalesPaymentMethod,
  SalesPaymentStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type SalesPaymentRecord = Prisma.SalesPaymentGetPayload<object>;
export type SalesPaymentWithAllocations = Prisma.SalesPaymentGetPayload<{
  include: { allocations: true };
}>;
export type PaymentBusinessPartner = Prisma.BusinessPartnerGetPayload<object>;

export interface CreateSalesPaymentData {
  workspaceId: string;
  number: string;
  businessPartnerId: string;
  method: SalesPaymentMethod;
  amount: Prisma.Decimal;
  currencyCode: string;
  paymentDate: Date;
  externalReference?: string;
  notes?: string;
}

export interface AddSalesPaymentAllocationData {
  workspaceId: string;
  salesPaymentId: string;
  salesInvoiceId: string;
  amount: Prisma.Decimal;
}

export class SalesPaymentStateConflictError extends Error {
  constructor() {
    super("Sales payment state changed concurrently");
    this.name = "SalesPaymentStateConflictError";
  }
}

export class SalesPaymentAllocationReferenceError extends Error {
  constructor() {
    super("Sales payment allocation references are inconsistent");
    this.name = "SalesPaymentAllocationReferenceError";
  }
}

export class SalesPaymentAllocationExceedsBalanceError extends Error {
  constructor() {
    super("Sales payment allocation exceeds invoice balance");
    this.name = "SalesPaymentAllocationExceedsBalanceError";
  }
}

export class SalesPaymentAllocationExceedsPaymentError extends Error {
  constructor() {
    super("Sales payment allocations exceed payment amount");
    this.name = "SalesPaymentAllocationExceedsPaymentError";
  }
}

export class SalesPaymentAllocationNotFoundError extends Error {
  constructor() {
    super("Sales payment allocation was not found");
    this.name = "SalesPaymentAllocationNotFoundError";
  }
}

export class SalesPaymentAllocationMismatchError extends Error {
  constructor() {
    super("Sales payment allocations do not match payment amount");
    this.name = "SalesPaymentAllocationMismatchError";
  }
}

export class SalesPaymentInvoiceUpdateRejectedError extends Error {
  constructor() {
    super("Sales invoice payment update was rejected");
    this.name = "SalesPaymentInvoiceUpdateRejectedError";
  }
}

@Injectable()
export class SalesPaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSalesPaymentData): Promise<SalesPaymentWithAllocations> {
    return this.prisma.salesPayment.create({
      data,
      include: { allocations: { orderBy: this.allocationOrder } },
    });
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<SalesPaymentWithAllocations | null> {
    return this.prisma.salesPayment.findFirst({
      where: { id, workspaceId },
      include: { allocations: { orderBy: this.allocationOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<SalesPaymentRecord[]> {
    return this.prisma.salesPayment.findMany({
      where: { workspaceId },
      orderBy: [{ paymentDate: "desc" }, { number: "asc" }],
    });
  }

  findByInvoice(
    workspaceId: string,
    salesInvoiceId: string,
  ): Promise<SalesPaymentRecord[]> {
    return this.prisma.salesPayment.findMany({
      where: {
        workspaceId,
        allocations: { some: { workspaceId, salesInvoiceId } },
      },
      orderBy: [{ paymentDate: "desc" }, { number: "asc" }],
    });
  }

  addAllocation(
    data: AddSalesPaymentAllocationData,
  ): Promise<SalesPaymentWithAllocations> {
    return this.prisma.$transaction(
      async (transaction) => {
        const payment = await transaction.salesPayment.findFirst({
          where: {
            id: data.salesPaymentId,
            workspaceId: data.workspaceId,
            status: SalesPaymentStatus.DRAFT,
          },
        });

        if (!payment) {
          throw new SalesPaymentStateConflictError();
        }

        const invoice = await transaction.salesInvoice.findFirst({
          where: {
            id: data.salesInvoiceId,
            workspaceId: data.workspaceId,
            status: {
              in: [
                SalesInvoiceStatus.ISSUED,
                SalesInvoiceStatus.PARTIALLY_PAID,
              ],
            },
          },
        });

        if (
          !invoice ||
          invoice.businessPartnerId !== payment.businessPartnerId ||
          invoice.currencyCode !== payment.currencyCode
        ) {
          throw new SalesPaymentAllocationReferenceError();
        }

        const balance = invoice.totalAmount.minus(invoice.paidAmount);

        if (data.amount.greaterThan(balance)) {
          throw new SalesPaymentAllocationExceedsBalanceError();
        }

        const allocated = await transaction.salesPaymentAllocation.aggregate({
          where: {
            workspaceId: data.workspaceId,
            salesPaymentId: data.salesPaymentId,
          },
          _sum: { amount: true },
        });
        const allocatedAmount =
          allocated._sum.amount ?? new Prisma.Decimal(0);

        if (allocatedAmount.plus(data.amount).greaterThan(payment.amount)) {
          throw new SalesPaymentAllocationExceedsPaymentError();
        }

        await transaction.salesPaymentAllocation.create({ data });
        return this.findByIdOrThrow(
          transaction,
          data.workspaceId,
          data.salesPaymentId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  removeAllocation(
    workspaceId: string,
    salesPaymentId: string,
    allocationId: string,
  ): Promise<SalesPaymentWithAllocations> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.claimDraftPayment(
          transaction,
          workspaceId,
          salesPaymentId,
        );
        const deleted = await transaction.salesPaymentAllocation.deleteMany({
          where: { id: allocationId, workspaceId, salesPaymentId },
        });

        if (deleted.count !== 1) {
          throw new SalesPaymentAllocationNotFoundError();
        }

        return this.findByIdOrThrow(
          transaction,
          workspaceId,
          salesPaymentId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  confirm(
    workspaceId: string,
    id: string,
  ): Promise<SalesPaymentWithAllocations> {
    return this.prisma.$transaction(
      async (transaction) => {
        const confirmedAt = new Date();
        const payments = await transaction.salesPayment.updateManyAndReturn({
          where: { id, workspaceId, status: SalesPaymentStatus.DRAFT },
          data: { status: SalesPaymentStatus.CONFIRMED, confirmedAt },
          select: {
            id: true,
            businessPartnerId: true,
            amount: true,
            currencyCode: true,
          },
        });
        const payment = payments[0];

        if (!payment) {
          throw new SalesPaymentStateConflictError();
        }

        const allocations = await transaction.salesPaymentAllocation.findMany({
          where: { workspaceId, salesPaymentId: id },
          orderBy: { id: "asc" },
        });
        const allocatedAmount = allocations.reduce(
          (total, allocation) => total.plus(allocation.amount),
          new Prisma.Decimal(0),
        );

        if (
          allocations.length === 0 ||
          !allocatedAmount.equals(payment.amount)
        ) {
          throw new SalesPaymentAllocationMismatchError();
        }

        for (const allocation of allocations) {
          const invoice = await transaction.salesInvoice.findFirst({
            where: {
              id: allocation.salesInvoiceId,
              workspaceId,
              businessPartnerId: payment.businessPartnerId,
              currencyCode: payment.currencyCode,
              status: {
                in: [
                  SalesInvoiceStatus.ISSUED,
                  SalesInvoiceStatus.PARTIALLY_PAID,
                ],
              },
            },
          });

          if (!invoice) {
            throw new SalesPaymentAllocationReferenceError();
          }

          const balance = invoice.totalAmount.minus(invoice.paidAmount);

          if (allocation.amount.greaterThan(balance)) {
            throw new SalesPaymentAllocationExceedsBalanceError();
          }

          const paidAmount = invoice.paidAmount.plus(allocation.amount);
          const status = paidAmount.equals(invoice.totalAmount)
            ? SalesInvoiceStatus.PAID
            : SalesInvoiceStatus.PARTIALLY_PAID;
          const updated = await transaction.salesInvoice.updateManyAndReturn({
            where: {
              id: invoice.id,
              workspaceId,
              businessPartnerId: payment.businessPartnerId,
              currencyCode: payment.currencyCode,
              paidAmount: invoice.paidAmount,
              status: {
                in: [
                  SalesInvoiceStatus.ISSUED,
                  SalesInvoiceStatus.PARTIALLY_PAID,
                ],
              },
            },
            data: { paidAmount, status },
            select: { id: true },
          });

          if (!updated[0]) {
            throw new SalesPaymentInvoiceUpdateRejectedError();
          }
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<SalesPaymentWithAllocations | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const cancelledAt = new Date();
        const payments = await transaction.salesPayment.updateManyAndReturn({
          where: { id, workspaceId, status: SalesPaymentStatus.DRAFT },
          data: { status: SalesPaymentStatus.CANCELLED, cancelledAt },
          select: { id: true },
        });

        if (!payments[0]) {
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
  ): Promise<PaymentBusinessPartner | null> {
    return this.prisma.businessPartner.findFirst({
      where: { id, workspaceId },
    });
  }

  private async claimDraftPayment(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const claimed = await transaction.salesPayment.updateMany({
      where: { id, workspaceId, status: SalesPaymentStatus.DRAFT },
      data: { updatedAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new SalesPaymentStateConflictError();
    }
  }

  private findByIdOrThrow(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<SalesPaymentWithAllocations> {
    return transaction.salesPayment.findUniqueOrThrow({
      where: { id, workspaceId },
      include: { allocations: { orderBy: this.allocationOrder } },
    });
  }

  private readonly allocationOrder = [
    { createdAt: "asc" as const },
    { id: "asc" as const },
  ];
}
