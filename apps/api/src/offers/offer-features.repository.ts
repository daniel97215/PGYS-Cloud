import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const offerFeatureInclude = {
  offer: true,
  feature: true,
} as const;

export type OfferFeatureRecord = Prisma.OfferFeatureGetPayload<{
  include: typeof offerFeatureInclude;
}>;

export type OfferFeatureOfferRecord = Prisma.OfferGetPayload<object>;
export type OfferFeatureFeatureRecord = Prisma.FeatureGetPayload<object>;

@Injectable()
export class OfferFeaturesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOfferByKey(key: string): Promise<OfferFeatureOfferRecord | null> {
    return this.prisma.offer.findUnique({
      where: { key },
    });
  }

  findFeatureByKey(key: string): Promise<OfferFeatureFeatureRecord | null> {
    return this.prisma.feature.findUnique({
      where: { key },
    });
  }

  findByOfferAndFeature(
    offerId: string,
    featureId: string,
  ): Promise<OfferFeatureRecord | null> {
    return this.prisma.offerFeature.findUnique({
      where: {
        offerId_featureId: {
          offerId,
          featureId,
        },
      },
      include: offerFeatureInclude,
    });
  }

  addFeatureToOffer(
    offerId: string,
    featureId: string,
  ): Promise<OfferFeatureRecord> {
    return this.prisma.offerFeature.upsert({
      where: {
        offerId_featureId: {
          offerId,
          featureId,
        },
      },
      update: { enabled: true },
      create: {
        offerId,
        featureId,
        enabled: true,
      },
      include: offerFeatureInclude,
    });
  }

  removeFeatureFromOffer(
    offerId: string,
    featureId: string,
  ): Promise<OfferFeatureRecord> {
    return this.prisma.offerFeature.update({
      where: {
        offerId_featureId: {
          offerId,
          featureId,
        },
      },
      data: { enabled: false },
      include: offerFeatureInclude,
    });
  }

  findFeaturesByOffer(offerId: string): Promise<OfferFeatureRecord[]> {
    return this.prisma.offerFeature.findMany({
      where: {
        offerId,
        enabled: true,
      },
      include: offerFeatureInclude,
      orderBy: {
        feature: { key: "asc" },
      },
    });
  }

  findOffersByFeature(featureId: string): Promise<OfferFeatureRecord[]> {
    return this.prisma.offerFeature.findMany({
      where: {
        featureId,
        enabled: true,
      },
      include: offerFeatureInclude,
      orderBy: {
        offer: { key: "asc" },
      },
    });
  }
}
