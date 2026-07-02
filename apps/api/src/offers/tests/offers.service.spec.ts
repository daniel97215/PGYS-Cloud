import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  OFFER_STATUS_ARCHIVED,
  OffersRepository,
} from "../offers.repository";
import { OffersService } from "../offers.service";

describe("OffersService", () => {
  let repository: jest.Mocked<OffersRepository>;
  let service: OffersService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(offer),
      update: jest.fn().mockResolvedValue(offer),
      findAll: jest.fn().mockResolvedValue([offer]),
      findByKey: jest.fn().mockResolvedValue(offer),
      archive: jest.fn().mockResolvedValue({
        ...offer,
        status: OFFER_STATUS_ARCHIVED,
      }),
    } as unknown as jest.Mocked<OffersRepository>;

    service = new OffersService(repository);
  });

  it("creates an offer", async () => {
    const result = await service.createOffer({
      key: "CRM-Starter",
      name: "CRM Starter",
      description: "Entry CRM offer",
    });

    expect(result).toEqual(offer);
    expect(repository.create).toHaveBeenCalledWith({
      key: offer.key,
      name: offer.name,
      description: offer.description,
    });
  });

  it("updates an offer", async () => {
    const result = await service.updateOffer(offer.key, {
      name: "CRM Pro",
    });

    expect(result).toEqual(offer);
    expect(repository.findByKey).toHaveBeenCalledWith(offer.key);
    expect(repository.update).toHaveBeenCalledWith(offer.key, {
      name: "CRM Pro",
    });
  });

  it("lists offers", async () => {
    const result = await service.listOffers();

    expect(result).toEqual([offer]);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  it("gets an offer", async () => {
    const result = await service.getOffer(offer.key);

    expect(result).toEqual(offer);
    expect(repository.findByKey).toHaveBeenCalledWith(offer.key);
  });

  it("archives an offer", async () => {
    const result = await service.archiveOffer(offer.key);

    expect(result.status).toBe(OFFER_STATUS_ARCHIVED);
    expect(repository.archive).toHaveBeenCalledWith(offer.key);
  });

  it("throws NotFoundException when an offer is unknown", async () => {
    repository.findByKey.mockResolvedValueOnce(null);

    await expect(service.getOffer("unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws BadRequestException when key is blank", async () => {
    await expect(service.getOffer(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
