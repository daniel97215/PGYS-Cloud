import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const platformSubscriptionSelect = {
  id: true,
  status: true,
  startedAt: true,
  endsAt: true,
  cancelledAt: true,
  renewalDate: true,
  createdAt: true,
  updatedAt: true,
  workspace: {
    select: { id: true, displayName: true, slug: true },
  },
  offer: {
    select: { id: true, key: true, name: true },
  },
  price: {
    select: {
      id: true,
      amount: true,
      currency: true,
      billingPeriod: true,
    },
  },
} satisfies Prisma.SubscriptionSelect;

export type PlatformSubscriptionRecord = Prisma.SubscriptionGetPayload<{
  select: typeof platformSubscriptionSelect;
}>;

export interface PlatformSubscriptionCriteria {
  search?: string;
  status?: string;
  workspaceId?: string;
  offerId?: string;
  page?: number;
  pageSize?: number;
}

export interface PlatformSubscriptionPage {
  items: PlatformSubscriptionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class PlatformSubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    criteria: PlatformSubscriptionCriteria,
  ): Promise<PlatformSubscriptionPage> {
    const page = Math.max(criteria.page ?? 1, 1);
    const pageSize = Math.min(Math.max(criteria.pageSize ?? 25, 1), 100);
    const where = this.where(criteria);
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        select: platformSubscriptionSelect,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findById(id: string): Promise<PlatformSubscriptionRecord | null> {
    return this.prisma.subscription.findUnique({
      where: { id },
      select: platformSubscriptionSelect,
    });
  }

  private where(
    criteria: PlatformSubscriptionCriteria,
  ): Prisma.SubscriptionWhereInput {
    const search = criteria.search?.trim();

    return {
      ...(criteria.status ? { status: criteria.status } : {}),
      ...(criteria.workspaceId ? { workspaceId: criteria.workspaceId } : {}),
      ...(criteria.offerId ? { offerId: criteria.offerId } : {}),
      ...(search
        ? {
            OR: [
              {
                workspace: {
                  displayName: { contains: search, mode: "insensitive" },
                },
              },
              {
                workspace: {
                  slug: { contains: search, mode: "insensitive" },
                },
              },
              {
                offer: { name: { contains: search, mode: "insensitive" } },
              },
              {
                offer: { key: { contains: search, mode: "insensitive" } },
              },
            ],
          }
        : {}),
    };
  }
}
