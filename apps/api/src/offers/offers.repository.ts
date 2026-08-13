import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OFFER_STATUSES, OfferStatus } from "./offers.constants";

export type OfferRecord = Prisma.OfferGetPayload<object>;

export interface CreateOfferData {
  key: string;
  name: string;
  description?: string;
  status?: OfferStatus;
  visibility?: string;
}

export type UpdateOfferData = Omit<Partial<CreateOfferData>, "key">;

@Injectable()
export class OffersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOfferData): Promise<OfferRecord> {
    return this.prisma.offer.create({ data });
  }

  update(key: string, data: UpdateOfferData): Promise<OfferRecord> {
    return this.prisma.offer.update({
      where: { key },
      data,
    });
  }

  findAll(): Promise<OfferRecord[]> {
    return this.prisma.offer.findMany({
      orderBy: { key: "asc" },
    });
  }

  findByKey(key: string): Promise<OfferRecord | null> {
    return this.prisma.offer.findUnique({
      where: { key },
    });
  }

  async hasUsage(offerId: string): Promise<boolean> {
    const [subscriptions, checkouts] = await this.prisma.$transaction([
      this.prisma.subscription.count({ where: { offerId } }),
      this.prisma.checkoutSession.count({ where: { offerId } }),
    ]);
    return subscriptions > 0 || checkouts > 0;
  }

  async hasActivePrice(offerId: string, at: Date): Promise<boolean> {
    const count = await this.prisma.price.count({
      where: {
        offerId,
        status: "active",
        validFrom: { lte: at },
        OR: [{ validTo: null }, { validTo: { gt: at } }],
      },
    });
    return count > 0;
  }

  transition(
    offerId: string,
    currentStatus: OfferStatus,
    status: OfferStatus,
  ): Promise<OfferRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.offer.updateMany({
        where: { id: offerId, status: currentStatus },
        data: { status },
      });
      if (result.count === 0) return null;
      return transaction.offer.findUnique({ where: { id: offerId } });
    });
  }

  archive(key: string): Promise<OfferRecord> {
    return this.prisma.offer.update({
      where: { key },
      data: { status: OFFER_STATUSES.ARCHIVED },
    });
  }
}
