import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { OFFER_STATUSES, OFFER_STATUS_ARCHIVED } from "../offers.constants";
import { OffersRepository } from "../offers.repository";
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
      hasUsage: jest.fn().mockResolvedValue(false),
      hasActivePrice: jest.fn().mockResolvedValue(true),
      transition: jest.fn().mockImplementation(async (_id, _current, status) => ({
        ...offer,
        status,
      })),
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

  it("creates offers only as draft", async () => {
    await expect(
      service.createOffer({
        key: "crm-active",
        name: "CRM Active",
        status: OFFER_STATUSES.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
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
    repository.findByKey.mockResolvedValue({
      ...offer,
      status: OFFER_STATUSES.ACTIVE,
    });
    const result = await service.archiveOffer(offer.key);

    expect(result.status).toBe(OFFER_STATUS_ARCHIVED);
    expect(repository.transition).toHaveBeenCalledWith(
      offer.id,
      OFFER_STATUSES.ACTIVE,
      OFFER_STATUSES.ARCHIVED,
    );
  });

  it("activates only a draft offer with an active price", async () => {
    await service.activateOffer(offer.key);
    expect(repository.hasActivePrice).toHaveBeenCalledWith(offer.id, expect.any(Date));
    expect(repository.transition).toHaveBeenCalledWith(
      offer.id,
      OFFER_STATUSES.DRAFT,
      OFFER_STATUSES.ACTIVE,
    );

    repository.hasActivePrice.mockResolvedValue(false);
    await expect(service.activateOffer(offer.key)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("keeps a used offer immutable while allowing its archival", async () => {
    repository.hasUsage.mockResolvedValue(true);
    await expect(
      service.updateOffer(offer.key, { name: "Changed" }),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.findByKey.mockResolvedValue({
      ...offer,
      status: OFFER_STATUSES.ACTIVE,
    });
    await expect(service.archiveOffer(offer.key)).resolves.toEqual(
      expect.objectContaining({ status: OFFER_STATUSES.ARCHIVED }),
    );
  });

  it("does not reactivate an archived offer", async () => {
    repository.findByKey.mockResolvedValue({
      ...offer,
      status: OFFER_STATUSES.ARCHIVED,
    });
    await expect(service.activateOffer(offer.key)).rejects.toBeInstanceOf(
      ConflictException,
    );
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
