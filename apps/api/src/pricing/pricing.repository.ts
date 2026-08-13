import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PRICE_STATUSES, PriceStatus } from "./pricing.constants";

export type PriceRecord = Prisma.PriceGetPayload<object>;
export type PriceOfferRecord = Prisma.OfferGetPayload<object>;

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

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOfferByKey(key: string): Promise<PriceOfferRecord | null> {
    return this.prisma.offer.findUnique({
      where: { key },
    });
  }

  findOfferById(id: string): Promise<PriceOfferRecord | null> {
    return this.prisma.offer.findUnique({ where: { id } });
  }

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

  findByOffer(offerId: string): Promise<PriceRecord[]> {
    return this.prisma.price.findMany({
      where: { offerId },
      orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
    });
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
