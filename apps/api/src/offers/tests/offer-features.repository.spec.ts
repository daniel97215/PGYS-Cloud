import { PrismaService } from "../../prisma/prisma.service";
import { OfferFeaturesRepository } from "../offer-features.repository";

describe("OfferFeaturesRepository", () => {
  const offer = {
    id: "10000000-0000-4000-8000-000000000001",
    key: "crm-starter",
    name: "CRM Starter",
    description: "Entry CRM offer",
    status: "draft",
    visibility: "public",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const feature = {
    id: "10000000-0000-4000-8000-000000000002",
    key: "crm.contacts",
    name: "CRM Contacts",
    description: "Manage CRM contacts",
    category: "crm",
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const offerFeature = {
    id: "10000000-0000-4000-8000-000000000003",
    offerId: offer.id,
    featureId: feature.id,
    enabled: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    offer,
    feature,
  };

  it("finds an offer by key through Prisma", async () => {
    const offerFindUnique = jest.fn().mockResolvedValue(offer);
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ offerFindUnique }),
    );

    const result = await repository.findOfferByKey(offer.key);

    expect(result).toEqual(offer);
    expect(offerFindUnique).toHaveBeenCalledWith({
      where: { key: offer.key },
    });
  });

  it("finds a feature by key through Prisma", async () => {
    const featureFindUnique = jest.fn().mockResolvedValue(feature);
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ featureFindUnique }),
    );

    const result = await repository.findFeatureByKey(feature.key);

    expect(result).toEqual(feature);
    expect(featureFindUnique).toHaveBeenCalledWith({
      where: { key: feature.key },
    });
  });

  it("finds an offer feature relation through Prisma", async () => {
    const offerFeatureFindUnique = jest.fn().mockResolvedValue(offerFeature);
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ offerFeatureFindUnique }),
    );

    const result = await repository.findByOfferAndFeature(
      offer.id,
      feature.id,
    );

    expect(result).toEqual(offerFeature);
    expect(offerFeatureFindUnique).toHaveBeenCalledWith({
      where: {
        offerId_featureId: {
          offerId: offer.id,
          featureId: feature.id,
        },
      },
      include: {
        offer: true,
        feature: true,
      },
    });
  });

  it("adds a feature to an offer through Prisma", async () => {
    const upsert = jest.fn().mockResolvedValue(offerFeature);
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ upsert }),
    );

    const result = await repository.addFeatureToOffer(offer.id, feature.id);

    expect(result).toEqual(offerFeature);
    expect(upsert).toHaveBeenCalledWith({
      where: {
        offerId_featureId: {
          offerId: offer.id,
          featureId: feature.id,
        },
      },
      update: { enabled: true },
      create: {
        offerId: offer.id,
        featureId: feature.id,
        enabled: true,
      },
      include: {
        offer: true,
        feature: true,
      },
    });
  });

  it("removes a feature from an offer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...offerFeature,
      enabled: false,
    });
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.removeFeatureFromOffer(
      offer.id,
      feature.id,
    );

    expect(result.enabled).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        offerId_featureId: {
          offerId: offer.id,
          featureId: feature.id,
        },
      },
      data: { enabled: false },
      include: {
        offer: true,
        feature: true,
      },
    });
  });

  it("lists features for an offer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([offerFeature]);
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findFeaturesByOffer(offer.id);

    expect(result).toEqual([offerFeature]);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        offerId: offer.id,
        enabled: true,
      },
      include: {
        offer: true,
        feature: true,
      },
      orderBy: {
        feature: { key: "asc" },
      },
    });
  });

  it("lists offers for a feature through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([offerFeature]);
    const repository = new OfferFeaturesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findOffersByFeature(feature.id);

    expect(result).toEqual([offerFeature]);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        featureId: feature.id,
        enabled: true,
      },
      include: {
        offer: true,
        feature: true,
      },
      orderBy: {
        offer: { key: "asc" },
      },
    });
  });
});

function createPrismaMock(methods: {
  offerFindUnique?: jest.Mock;
  featureFindUnique?: jest.Mock;
  offerFeatureFindUnique?: jest.Mock;
  upsert?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
}): PrismaService {
  const prisma = {
    offer: {
      findUnique: methods.offerFindUnique ?? jest.fn(),
    },
    feature: {
      findUnique: methods.featureFindUnique ?? jest.fn(),
    },
    offerFeature: {
      findUnique: methods.offerFeatureFindUnique ?? jest.fn(),
      upsert: methods.upsert ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
