import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PRICE_STATUS_ARCHIVED } from "../pricing.constants";
import { PricingRepository } from "../pricing.repository";
import { PricingService } from "../pricing.service";

describe("PricingService", () => {
  let repository: jest.Mocked<PricingRepository>;
  let service: PricingService;

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

  const price = {
    id: "10000000-0000-4000-8000-000000000002",
    offerId: offer.id,
    currency: "EUR",
    amount: 29.99,
    billingPeriod: "monthly",
    validFrom: new Date("2026-01-01T00:00:00.000Z"),
    validTo: null,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      findOfferByKey: jest.fn().mockResolvedValue(offer),
      findOfferById: jest.fn().mockResolvedValue(offer),
      hasOfferUsage: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(price),
      update: jest.fn().mockResolvedValue(price),
      findById: jest.fn().mockResolvedValue(price),
      findPageByOffer: jest.fn().mockResolvedValue({
        items: [price],
        total: 1,
        page: 2,
        pageSize: 10,
      }),
      findActiveByOffer: jest.fn().mockResolvedValue(price),
      archive: jest.fn().mockResolvedValue({
        ...price,
        status: PRICE_STATUS_ARCHIVED,
      }),
    } as unknown as jest.Mocked<PricingRepository>;

    service = new PricingService(repository);
  });

  it("creates a price for an offer", async () => {
    const result = await service.createPrice("CRM-Starter", {
      currency: "EUR",
      amount: price.amount,
      billingPeriod: price.billingPeriod,
      validFrom: price.validFrom,
    });

    expect(result).toEqual(price);
    expect(repository.findOfferByKey).toHaveBeenCalledWith(offer.key);
    expect(repository.create).toHaveBeenCalledWith({
      offerId: offer.id,
      currency: price.currency,
      amount: price.amount,
      billingPeriod: price.billingPeriod,
      validFrom: price.validFrom,
    });
  });

  it("updates a price", async () => {
    const result = await service.updatePrice(price.id, {
      amount: 39.99,
    });

    expect(result).toEqual(price);
    expect(repository.findById).toHaveBeenCalledWith(price.id);
    expect(repository.update).toHaveBeenCalledWith(price.id, {
      amount: 39.99,
    });
  });

  it("lists prices for an offer", async () => {
    const result = await service.listPricesForOffer(offer.key, {
      page: 2,
      pageSize: 10,
    });

    expect(result).toEqual({
      items: [price],
      total: 1,
      page: 2,
      pageSize: 10,
    });
    expect(repository.findPageByOffer).toHaveBeenCalledWith(offer.id, {
      page: 2,
      pageSize: 10,
    });
  });

  it("gets the active price for an offer", async () => {
    const result = await service.getActivePriceForOffer(offer.key);

    expect(result).toEqual(price);
    expect(repository.findActiveByOffer).toHaveBeenCalledWith(offer.id);
  });

  it("implements the public Pricing contract", async () => {
    const publicPrice = {
      id: price.id,
      offerId: price.offerId,
      currency: price.currency,
      amount: price.amount.toString(),
      billingPeriod: price.billingPeriod,
      validFrom: price.validFrom,
      validTo: price.validTo,
      status: price.status,
    };

    await expect(service.findById(price.id)).resolves.toEqual(publicPrice);
    await expect(service.findActiveByOfferId(offer.id)).resolves.toEqual(
      publicPrice,
    );
    await expect(
      service.listByOfferId(offer.id, { page: 2, pageSize: 10 }),
    ).resolves.toEqual({
      items: [publicPrice],
      total: 1,
      page: 2,
      pageSize: 10,
    });

    expect(repository.findById).toHaveBeenCalledWith(price.id);
    expect(repository.findActiveByOffer).toHaveBeenCalledWith(
      offer.id,
      undefined,
    );
    expect(repository.findPageByOffer).toHaveBeenCalledWith(offer.id, {
      page: 2,
      pageSize: 10,
    });
  });

  it("archives a price", async () => {
    const result = await service.archivePrice(price.id);

    expect(result.status).toBe(PRICE_STATUS_ARCHIVED);
    expect(repository.findById).toHaveBeenCalledWith(price.id);
    expect(repository.archive).toHaveBeenCalledWith(price.id);
  });

  it("throws NotFoundException when the offer is unknown", async () => {
    repository.findOfferByKey.mockResolvedValueOnce(null);

    await expect(
      service.createPrice("unknown", {
        amount: price.amount,
        billingPeriod: price.billingPeriod,
        validFrom: price.validFrom,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when the price is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.updatePrice("unknown", { amount: 39.99 })).rejects
      .toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when the active price is unknown", async () => {
    repository.findActiveByOffer.mockResolvedValueOnce(null);

    await expect(service.getActivePriceForOffer(offer.key)).rejects
      .toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when offer key is blank", async () => {
    await expect(service.listPricesForOffer(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("throws BadRequestException when price id is blank", async () => {
    await expect(service.archivePrice(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects price changes once the offer is used", async () => {
    repository.hasOfferUsage.mockResolvedValue(true);
    await expect(
      service.updatePrice(price.id, { amount: 39.99 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
