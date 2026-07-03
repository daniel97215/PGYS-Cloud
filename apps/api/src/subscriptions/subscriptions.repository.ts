import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const SUBSCRIPTION_STATUSES = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];

export type SubscriptionRecord = Prisma.SubscriptionGetPayload<object>;
export type SubscriptionWorkspaceRecord = Prisma.WorkspaceGetPayload<object>;
export type SubscriptionOfferRecord = Prisma.OfferGetPayload<object>;
export type SubscriptionPriceRecord = Prisma.PriceGetPayload<object>;

export interface CreateSubscriptionData {
  workspaceId: string;
  offerId: string;
  priceId?: string;
  status?: string;
  startedAt: Date;
  endsAt?: Date;
  renewalDate?: Date;
}

export type UpdateSubscriptionData = Partial<
  Pick<
    SubscriptionRecord,
    | "offerId"
    | "priceId"
    | "status"
    | "startedAt"
    | "endsAt"
    | "cancelledAt"
    | "renewalDate"
  >
>;

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findWorkspaceById(
    workspaceId: string,
  ): Promise<SubscriptionWorkspaceRecord | null> {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
  }

  findOfferByKey(offerKey: string): Promise<SubscriptionOfferRecord | null> {
    return this.prisma.offer.findUnique({
      where: { key: offerKey },
    });
  }

  findPriceById(priceId: string): Promise<SubscriptionPriceRecord | null> {
    return this.prisma.price.findUnique({
      where: { id: priceId },
    });
  }

  findById(subscriptionId: string): Promise<SubscriptionRecord | null> {
    return this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
  }

  findActiveByWorkspace(
    workspaceId: string,
  ): Promise<SubscriptionRecord | null> {
    return this.prisma.subscription.findFirst({
      where: {
        workspaceId,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
      },
      orderBy: { startedAt: "desc" },
    });
  }

  findActiveByWorkspaceAndOffer(
    workspaceId: string,
    offerId: string,
  ): Promise<SubscriptionRecord | null> {
    return this.prisma.subscription.findFirst({
      where: {
        workspaceId,
        offerId,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
      },
      orderBy: { startedAt: "desc" },
    });
  }

  listByWorkspace(workspaceId: string): Promise<SubscriptionRecord[]> {
    return this.prisma.subscription.findMany({
      where: { workspaceId },
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
    });
  }

  create(data: CreateSubscriptionData): Promise<SubscriptionRecord> {
    return this.prisma.subscription.create({ data });
  }

  update(
    subscriptionId: string,
    data: UpdateSubscriptionData,
  ): Promise<SubscriptionRecord> {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data,
    });
  }
}
