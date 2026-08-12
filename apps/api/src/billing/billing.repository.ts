import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BillingInvoiceStatus, BillingPeriod } from "./billing.constants";

const invoiceInclude = { lines: { orderBy: { position: "asc" as const } } };
const subscriptionInclude = { offer: true, price: true } as const;

export type BillingInvoiceRecord = Prisma.InvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;
export type BillingWorkspaceRecord = Prisma.WorkspaceGetPayload<object>;
export type BillingSubscriptionRecord = Prisma.SubscriptionGetPayload<{
  include: typeof subscriptionInclude;
}>;
export type BillingTaxRecord = Prisma.TaxGetPayload<object>;

export interface CreateBillingInvoiceData {
  workspaceId: string;
  subscriptionId: string;
  billingPeriod: BillingPeriod;
  periodStart: Date;
  periodEnd: Date;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  billingDetails: Prisma.InputJsonObject;
  dueAt: Date;
  line: {
    taxId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountRate: number;
    taxCode?: string;
    taxName?: string;
    taxRate: number;
    subtotalAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
}

@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findWorkspaceById(workspaceId: string): Promise<BillingWorkspaceRecord | null> {
    return this.prisma.workspace.findUnique({ where: { id: workspaceId } });
  }

  findSubscriptionById(
    subscriptionId: string,
  ): Promise<BillingSubscriptionRecord | null> {
    return this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: subscriptionInclude,
    });
  }

  findTaxByCode(
    workspaceId: string,
    code: string,
  ): Promise<BillingTaxRecord | null> {
    return this.prisma.tax.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
  }

  findByPeriod(
    workspaceId: string,
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingInvoiceRecord | null> {
    return this.prisma.invoice.findUnique({
      where: {
        workspaceId_subscriptionId_periodStart_periodEnd: {
          workspaceId,
          subscriptionId,
          periodStart,
          periodEnd,
        },
      },
      include: invoiceInclude,
    });
  }

  findById(
    workspaceId: string,
    invoiceId: string,
  ): Promise<BillingInvoiceRecord | null> {
    return this.prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId },
      include: invoiceInclude,
    });
  }

  list(workspaceId: string): Promise<BillingInvoiceRecord[]> {
    return this.prisma.invoice.findMany({
      where: { workspaceId },
      include: invoiceInclude,
      orderBy: [{ issuedAt: "desc" }, { number: "desc" }],
    });
  }

  create(data: CreateBillingInvoiceData): Promise<BillingInvoiceRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const sequence = await transaction.invoiceNumberSequence.upsert({
        where: { workspaceId: data.workspaceId },
        create: { workspaceId: data.workspaceId, nextValue: 2 },
        update: { nextValue: { increment: 1 } },
      });
      const number = `INV-${String(sequence.nextValue - 1).padStart(6, "0")}`;

      return transaction.invoice.create({
        data: {
          workspaceId: data.workspaceId,
          subscriptionId: data.subscriptionId,
          number,
          billingPeriod: data.billingPeriod,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          subtotalAmount: data.subtotalAmount,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          totalAmount: data.totalAmount,
          currency: data.currency,
          billingDetails: data.billingDetails,
          dueAt: data.dueAt,
          lines: {
            create: {
              workspaceId: data.workspaceId,
              position: 1,
              ...data.line,
            },
          },
        },
        include: invoiceInclude,
      });
    });
  }

  transition(
    workspaceId: string,
    invoiceId: string,
    currentStatus: BillingInvoiceStatus,
    status: BillingInvoiceStatus,
    paidAt?: Date,
  ): Promise<BillingInvoiceRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.invoice.updateMany({
        where: { id: invoiceId, workspaceId, status: currentStatus },
        data: { status, paidAt: paidAt ?? undefined },
      });
      if (result.count === 0) {
        return null;
      }
      return transaction.invoice.findUnique({
        where: { id: invoiceId },
        include: invoiceInclude,
      });
    });
  }
}
