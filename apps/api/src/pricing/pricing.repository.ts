import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Page } from "../common/dto/pagination-query.dto";
import { PRICE_STATUSES, PriceStatus } from "./pricing.constants";

export type PriceRecord = Prisma.PriceGetPayload<object>;

export interface CreatePriceData {
  offerId: string;
  currency?: string;
  amount: number;
  billingPeriod: string;
  validFrom: Date;
  validTo?: Date;
  status?: PriceStatus;
}

export type UpdatePriceData = Partial<Omit<CreatePriceData, "offerId">>;

export interface PricePagination {
  page?: number;
  pageSize?: number;
}

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async hasOfferUsage(offerId: string): Promise<boolean> {
    const [subscriptions, checkouts] = await this.prisma.$transaction([
      this.prisma.subscription.count({ where: { offerId } }),
      this.prisma.checkoutSession.count({ where: { offerId } }),
    ]);
    return subscriptions > 0 || checkouts > 0;
  }

  create(data: CreatePriceData): Promise<PriceRecord> {
    return this.prisma.price.create({ data });
  }

  update(id: string, data: UpdatePriceData): Promise<PriceRecord> {
    return this.prisma.price.update({
      where: { id },
      data,
    });
  }

  findById(id: string): Promise<PriceRecord | null> {
    return this.prisma.price.findUnique({
      where: { id },
    });
  }

  async findPageByOffer(
    offerId: string,
    pagination: PricePagination,
  ): Promise<Page<PriceRecord>> {
    const page = Math.max(pagination.page ?? 1, 1);
    const pageSize = Math.min(Math.max(pagination.pageSize ?? 25, 1), 100);
    const where = { offerId };
    const [items, total] = await Promise.all([
      this.prisma.price.findMany({
        where,
        orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.price.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findActiveByOffer(
    offerId: string,
    at: Date = new Date(),
  ): Promise<PriceRecord | null> {
    return this.prisma.price.findFirst({
      where: {
        offerId,
        status: PRICE_STATUSES.ACTIVE,
        validFrom: { lte: at },
        OR: [{ validTo: null }, { validTo: { gte: at } }],
      },
      orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
    });
  }

  archive(id: string): Promise<PriceRecord> {
    return this.prisma.price.update({
      where: { id },
      data: { status: PRICE_STATUSES.ARCHIVED },
    });
  }
}
