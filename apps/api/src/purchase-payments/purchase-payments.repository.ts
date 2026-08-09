import { Injectable } from "@nestjs/common";
import {
  Prisma,
  PurchaseInvoiceStatus,
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PurchaseInvoicesRepository } from "../purchase-invoices/purchase-invoices.repository";

export type PurchasePaymentRecord = Prisma.PurchasePaymentGetPayload<object>;
export type PurchasePaymentInvoice =
  Prisma.PurchaseInvoiceGetPayload<object>;

export interface CreatePurchasePaymentData {
  workspaceId: string;
  number: string;
  purchaseInvoiceId: string;
  amount: Prisma.Decimal;
  currencyCode: string;
  paymentMethod: PurchasePaymentMethod;
  paymentDate: Date;
  externalReference?: string;
  notes?: string;
}

export interface UpdatePurchasePaymentData {
  number?: string;
  purchaseInvoiceId?: string;
  amount?: Prisma.Decimal;
  currencyCode?: string;
  paymentMethod?: PurchasePaymentMethod;
  paymentDate?: Date;
  externalReference?: string;
  notes?: string;
}

export interface PurchasePaymentSearchCriteria {
  purchaseInvoiceId?: string;
  status?: PurchasePaymentStatus;
  paymentMethod?: PurchasePaymentMethod;
  paymentDateFrom?: Date;
  paymentDateTo?: Date;
}

export class PurchasePaymentStateConflictError extends Error {
  constructor() {
    super("Purchase payment state changed concurrently");
    this.name = "PurchasePaymentStateConflictError";
  }
}

export class PurchasePaymentInvoiceReferenceError extends Error {
  constructor() {
    super("Purchase invoice is not payable or does not match the payment");
    this.name = "PurchasePaymentInvoiceReferenceError";
  }
}

export class PurchasePaymentExceedsBalanceError extends Error {
  constructor() {
    super("Purchase payment exceeds invoice balance");
    this.name = "PurchasePaymentExceedsBalanceError";
  }
}

export class PurchasePaymentInvoiceUpdateRejectedError extends Error {
  constructor() {
    super("Purchase invoice payment update was rejected");
    this.name = "PurchasePaymentInvoiceUpdateRejectedError";
  }
}

@Injectable()
export class PurchasePaymentsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purchaseInvoicesRepository: PurchaseInvoicesRepository,
  ) {}

  create(data: CreatePurchasePaymentData): Promise<PurchasePaymentRecord> {
    return this.prisma.purchasePayment.create({ data });
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdatePurchasePaymentData,
  ): Promise<PurchasePaymentRecord> {
    return this.prisma.$transaction(
      async (transaction) => {
        const payments = await transaction.purchasePayment.updateManyAndReturn({
          where: { id, workspaceId, status: PurchasePaymentStatus.DRAFT },
          data,
        });

        if (!payments[0]) {
          throw new PurchasePaymentStateConflictError();
        }

        return payments[0];
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentRecord | null> {
    return this.prisma.purchasePayment.findFirst({
      where: { id, workspaceId },
    });
  }

  findByWorkspace(
    workspaceId: string,
    criteria: PurchasePaymentSearchCriteria,
  ): Promise<PurchasePaymentRecord[]> {
    return this.prisma.purchasePayment.findMany({
      where: {
        workspaceId,
        ...(criteria.purchaseInvoiceId === undefined
          ? {}
          : { purchaseInvoiceId: criteria.purchaseInvoiceId }),
        ...(criteria.status === undefined ? {} : { status: criteria.status }),
        ...(criteria.paymentMethod === undefined
          ? {}
          : { paymentMethod: criteria.paymentMethod }),
        ...(criteria.paymentDateFrom === undefined &&
        criteria.paymentDateTo === undefined
          ? {}
          : {
              paymentDate: {
                ...(criteria.paymentDateFrom === undefined
                  ? {}
                  : { gte: criteria.paymentDateFrom }),
                ...(criteria.paymentDateTo === undefined
                  ? {}
                  : { lte: criteria.paymentDateTo }),
              },
            }),
      },
      orderBy: [{ paymentDate: "desc" }, { number: "asc" }],
    });
  }

  confirm(workspaceId: string, id: string): Promise<PurchasePaymentRecord> {
    return this.prisma.$transaction(
      async (transaction) => {
        const confirmedAt = new Date();
        const payments = await transaction.purchasePayment.updateManyAndReturn({
          where: { id, workspaceId, status: PurchasePaymentStatus.DRAFT },
          data: { status: PurchasePaymentStatus.CONFIRMED, confirmedAt },
        });
        const payment = payments[0];

        if (!payment) {
          throw new PurchasePaymentStateConflictError();
        }

        if (!payment.amount.isFinite() || payment.amount.lessThanOrEqualTo(0)) {
          throw new PurchasePaymentInvoiceReferenceError();
        }

        const invoice =
          await this.purchaseInvoicesRepository.findPayableInTransaction(
            transaction,
            workspaceId,
            payment.purchaseInvoiceId,
            payment.currencyCode,
          );

        if (!invoice) {
          throw new PurchasePaymentInvoiceReferenceError();
        }

        const paid = await transaction.purchasePayment.aggregate({
          where: {
            workspaceId,
            purchaseInvoiceId: invoice.id,
            status: PurchasePaymentStatus.CONFIRMED,
          },
          _sum: { amount: true },
        });
        const paidAmount = paid._sum.amount ?? new Prisma.Decimal(0);

        if (paidAmount.greaterThan(invoice.totalAmount)) {
          throw new PurchasePaymentExceedsBalanceError();
        }

        const status = paidAmount.equals(invoice.totalAmount)
          ? PurchaseInvoiceStatus.PAID
          : PurchaseInvoiceStatus.PARTIALLY_PAID;
        const updated =
          await this.purchaseInvoicesRepository.updatePaymentStatusInTransaction(
            transaction,
            workspaceId,
            invoice.id,
            invoice.paidAmount,
            invoice.status,
            paidAmount,
            status,
          );

        if (!updated) {
          throw new PurchasePaymentInvoiceUpdateRejectedError();
        }

        return payment;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentRecord | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const payments = await transaction.purchasePayment.updateManyAndReturn({
          where: { id, workspaceId, status: PurchasePaymentStatus.DRAFT },
          data: { status: PurchasePaymentStatus.CANCELLED },
        });

        return payments[0] ?? null;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findInvoice(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentInvoice | null> {
    return this.purchaseInvoicesRepository.findById(workspaceId, id);
  }
}
