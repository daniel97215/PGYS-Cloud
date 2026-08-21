import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Page } from "../common/dto/pagination-query.dto";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionStatus,
} from "./subscriptions.constants";

export type SubscriptionRecord = Prisma.SubscriptionGetPayload<object>;

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

export interface SubscriptionPagination {
  page?: number;
  pageSize?: number;
}

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async findPageByWorkspace(
    workspaceId: string,
    pagination: SubscriptionPagination,
  ): Promise<Page<SubscriptionRecord>> {
    const page = Math.max(pagination.page ?? 1, 1);
    const pageSize = Math.min(Math.max(pagination.pageSize ?? 25, 1), 100);
    const where = { workspaceId };
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return { items, total, page, pageSize };
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

  transition(
    subscriptionId: string,
    currentStatus: SubscriptionStatus,
    status: SubscriptionStatus,
    data: UpdateSubscriptionData = {},
  ): Promise<SubscriptionRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.subscription.updateMany({
        where: { id: subscriptionId, status: currentStatus },
        data: { ...data, status },
      });
      if (result.count === 0) return null;
      return transaction.subscription.findUnique({
        where: { id: subscriptionId },
      });
    });
  }
}
