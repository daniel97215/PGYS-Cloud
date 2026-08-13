import { Injectable } from "@nestjs/common";
import { CheckoutStatus, Prisma } from "@prisma/client";
import { BILLING_INVOICE_STATUSES } from "../billing/billing.constants";
import { PrismaService } from "../prisma/prisma.service";
import { SUBSCRIPTION_STATUSES } from "../subscriptions/subscriptions.constants";
import { CheckoutBillingPeriod } from "./checkout.constants";

const checkoutInclude = { subscription: true, invoice: true } as const;
const priceInclude = { offer: true } as const;

export type CheckoutRecord = Prisma.CheckoutSessionGetPayload<{
  include: typeof checkoutInclude;
}>;
export type CheckoutWorkspaceRecord = Prisma.WorkspaceGetPayload<object>;
export type CheckoutPriceRecord = Prisma.PriceGetPayload<{
  include: typeof priceInclude;
}>;

export interface CreateCheckoutData {
  workspaceId: string;
  offerId: string;
  priceId: string;
  idempotencyKey: string;
  amount: number;
  currency: string;
  billingPeriod: CheckoutBillingPeriod;
  expiresAt: Date;
}

export interface CompleteCheckoutData {
  workspaceId: string;
  checkoutId: string;
  offerId: string;
  priceId: string;
  completedAt: Date;
  periodEnd: Date;
  amount: number;
  currency: string;
  billingPeriod: CheckoutBillingPeriod;
  offerName: string;
  billingDetails: Prisma.InputJsonObject;
}

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  findWorkspaceById(
    workspaceId: string,
  ): Promise<CheckoutWorkspaceRecord | null> {
    return this.prisma.workspace.findUnique({ where: { id: workspaceId } });
  }

  findPrice(
    offerId: string,
    priceId: string,
  ): Promise<CheckoutPriceRecord | null> {
    return this.prisma.price.findFirst({
      where: { id: priceId, offerId },
      include: priceInclude,
    });
  }

  findActiveSubscription(workspaceId: string, offerId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        workspaceId,
        offerId,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
      },
    });
  }

  findByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<CheckoutRecord | null> {
    return this.prisma.checkoutSession.findUnique({
      where: { workspaceId_idempotencyKey: { workspaceId, idempotencyKey } },
      include: checkoutInclude,
    });
  }

  findById(
    workspaceId: string,
    checkoutId: string,
  ): Promise<CheckoutRecord | null> {
    return this.prisma.checkoutSession.findFirst({
      where: { id: checkoutId, workspaceId },
      include: checkoutInclude,
    });
  }

  list(workspaceId: string): Promise<CheckoutRecord[]> {
    return this.prisma.checkoutSession.findMany({
      where: { workspaceId },
      include: checkoutInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: CreateCheckoutData): Promise<CheckoutRecord> {
    return this.prisma.checkoutSession.upsert({
      where: {
        workspaceId_idempotencyKey: {
          workspaceId: data.workspaceId,
          idempotencyKey: data.idempotencyKey,
        },
      },
      create: data,
      update: {},
      include: checkoutInclude,
    });
  }

  expireOpen(workspaceId: string, now: Date): Promise<Prisma.BatchPayload> {
    return this.prisma.checkoutSession.updateMany({
      where: {
        workspaceId,
        status: CheckoutStatus.OPEN,
        expiresAt: { lte: now },
      },
      data: { status: CheckoutStatus.EXPIRED },
    });
  }

  cancel(
    workspaceId: string,
    checkoutId: string,
    cancelledAt: Date,
  ): Promise<CheckoutRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.checkoutSession.updateMany({
        where: { id: checkoutId, workspaceId, status: CheckoutStatus.OPEN },
        data: { status: CheckoutStatus.CANCELLED, cancelledAt },
      });
      if (result.count === 0) return null;
      return transaction.checkoutSession.findUnique({
        where: { id: checkoutId },
        include: checkoutInclude,
      });
    });
  }

  complete(data: CompleteCheckoutData): Promise<CheckoutRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.checkoutSession.updateMany({
        where: {
          id: data.checkoutId,
          workspaceId: data.workspaceId,
          status: CheckoutStatus.OPEN,
          expiresAt: { gt: data.completedAt },
        },
        data: {
          status: CheckoutStatus.COMPLETED,
          completedAt: data.completedAt,
        },
      });
      if (claimed.count === 0) return null;

      const subscription = await transaction.subscription.create({
        data: {
          workspaceId: data.workspaceId,
          offerId: data.offerId,
          priceId: data.priceId,
          status: SUBSCRIPTION_STATUSES.ACTIVE,
          startedAt: data.completedAt,
          renewalDate: data.periodEnd,
        },
      });
      const sequence = await transaction.invoiceNumberSequence.upsert({
        where: { workspaceId: data.workspaceId },
        create: { workspaceId: data.workspaceId, nextValue: 2 },
        update: { nextValue: { increment: 1 } },
      });
      const number = `INV-${String(sequence.nextValue - 1).padStart(6, "0")}`;
      const invoice = await transaction.invoice.create({
        data: {
          workspaceId: data.workspaceId,
          subscriptionId: subscription.id,
          number,
          status: BILLING_INVOICE_STATUSES.DRAFT,
          billingPeriod: data.billingPeriod,
          periodStart: data.completedAt,
          periodEnd: data.periodEnd,
          subtotalAmount: data.amount,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: data.amount,
          currency: data.currency,
          billingDetails: data.billingDetails,
          dueAt: data.periodEnd,
          lines: {
            create: {
              workspaceId: data.workspaceId,
              position: 1,
              description: `${data.offerName} - ${data.billingPeriod.toLowerCase()}`,
              quantity: 1,
              unitPrice: data.amount,
              discountRate: 0,
              taxRate: 0,
              subtotalAmount: data.amount,
              discountAmount: 0,
              taxAmount: 0,
              totalAmount: data.amount,
            },
          },
        },
      });

      return transaction.checkoutSession.update({
        where: { id: data.checkoutId },
        data: { subscriptionId: subscription.id, invoiceId: invoice.id },
        include: checkoutInclude,
      });
    });
  }
}
