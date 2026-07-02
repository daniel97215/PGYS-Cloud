import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const OFFER_STATUS_ARCHIVED = "archived";

export type OfferRecord = Prisma.OfferGetPayload<object>;

export interface CreateOfferData {
  key: string;
  name: string;
  description?: string;
  status?: string;
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

  archive(key: string): Promise<OfferRecord> {
    return this.prisma.offer.update({
      where: { key },
      data: { status: OFFER_STATUS_ARCHIVED },
    });
  }
}
