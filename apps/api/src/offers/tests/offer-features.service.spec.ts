import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OfferFeaturesRepository } from "../offer-features.repository";
import { OfferFeaturesService } from "../offer-features.service";

describe("OfferFeaturesService", () => {
  let repository: jest.Mocked<OfferFeaturesRepository>;
  let service: OfferFeaturesService;

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

  beforeEach(() => {
    repository = {
      findOfferByKey: jest.fn().mockResolvedValue(offer),
      findFeatureByKey: jest.fn().mockResolvedValue(feature),
      findByOfferAndFeature: jest.fn().mockResolvedValue(offerFeature),
      addFeatureToOffer: jest.fn().mockResolvedValue(offerFeature),
      removeFeatureFromOffer: jest.fn().mockResolvedValue({
        ...offerFeature,
        enabled: false,
      }),
      findFeaturesByOffer: jest.fn().mockResolvedValue([offerFeature]),
      findOffersByFeature: jest.fn().mockResolvedValue([offerFeature]),
    } as unknown as jest.Mocked<OfferFeaturesRepository>;

    service = new OfferFeaturesService(repository);
  });

  it("adds a feature to an offer", async () => {
    const result = await service.addFeatureToOffer(
      "CRM-Starter",
      "CRM.Contacts",
    );

    expect(result).toEqual(offerFeature);
    expect(repository.findOfferByKey).toHaveBeenCalledWith(offer.key);
    expect(repository.findFeatureByKey).toHaveBeenCalledWith(feature.key);
    expect(repository.addFeatureToOffer).toHaveBeenCalledWith(
      offer.id,
      feature.id,
    );
  });

  it("removes a feature from an offer", async () => {
    const result = await service.removeFeatureFromOffer(
      offer.key,
      feature.key,
    );

    expect(result.enabled).toBe(false);
    expect(repository.findByOfferAndFeature).toHaveBeenCalledWith(
      offer.id,
      feature.id,
    );
    expect(repository.removeFeatureFromOffer).toHaveBeenCalledWith(
      offer.id,
      feature.id,
    );
  });

  it("lists features for an offer", async () => {
    const result = await service.listFeaturesForOffer(offer.key);

    expect(result).toEqual([offerFeature]);
    expect(repository.findFeaturesByOffer).toHaveBeenCalledWith(offer.id);
  });

  it("lists offers for a feature", async () => {
    const result = await service.listOffersForFeature(feature.key);

    expect(result).toEqual([offerFeature]);
    expect(repository.findOffersByFeature).toHaveBeenCalledWith(feature.id);
  });

  it("throws NotFoundException when the offer is unknown", async () => {
    repository.findOfferByKey.mockResolvedValueOnce(null);

    await expect(
      service.addFeatureToOffer("unknown", feature.key),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when the feature is unknown", async () => {
    repository.findFeatureByKey.mockResolvedValueOnce(null);

    await expect(
      service.addFeatureToOffer(offer.key, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when the relation is not enabled", async () => {
    repository.findByOfferAndFeature.mockResolvedValueOnce({
      ...offerFeature,
      enabled: false,
    });

    await expect(
      service.removeFeatureFromOffer(offer.key, feature.key),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when an offer key is blank", async () => {
    await expect(
      service.listFeaturesForOffer(" "),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws BadRequestException when a feature key is blank", async () => {
    await expect(
      service.listOffersForFeature(" "),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
