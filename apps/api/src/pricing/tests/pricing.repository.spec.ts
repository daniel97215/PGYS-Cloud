import { PrismaService } from "../../prisma/prisma.service";
import {
  PRICE_STATUS_ACTIVE,
  PRICE_STATUS_ARCHIVED,
  PricingRepository,
} from "../pricing.repository";

describe("PricingRepository", () => {
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
    status: PRICE_STATUS_ACTIVE,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("finds an offer by key through Prisma", async () => {
    const offerFindUnique = jest.fn().mockResolvedValue(offer);
    const repository = new PricingRepository(
      createPrismaMock({ offerFindUnique }),
    );

    const result = await repository.findOfferByKey(offer.key);

    expect(result).toEqual(offer);
    expect(offerFindUnique).toHaveBeenCalledWith({
      where: { key: offer.key },
    });
  });

  it("creates a price through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(price);
    const repository = new PricingRepository(createPrismaMock({ create }));

    const result = await repository.create({
      offerId: offer.id,
      currency: price.currency,
      amount: price.amount,
      billingPeriod: price.billingPeriod,
      validFrom: price.validFrom,
    });

    expect(result).toEqual(price);
    expect(create).toHaveBeenCalledWith({
      data: {
        offerId: offer.id,
        currency: price.currency,
        amount: price.amount,
        billingPeriod: price.billingPeriod,
        validFrom: price.validFrom,
      },
    });
  });

  it("updates a price through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(price);
    const repository = new PricingRepository(createPrismaMock({ update }));

    const result = await repository.update(price.id, {
      amount: 39.99,
    });

    expect(result).toEqual(price);
    expect(update).toHaveBeenCalledWith({
      where: { id: price.id },
      data: { amount: 39.99 },
    });
  });

  it("finds a price by id through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(price);
    const repository = new PricingRepository(createPrismaMock({ findUnique }));

    const result = await repository.findById(price.id);

    expect(result).toEqual(price);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: price.id },
    });
  });

  it("lists prices for an offer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([price]);
    const repository = new PricingRepository(createPrismaMock({ findMany }));

    const result = await repository.findByOffer(offer.id);

    expect(result).toEqual([price]);
    expect(findMany).toHaveBeenCalledWith({
      where: { offerId: offer.id },
      orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
    });
  });

  it("finds the active price for an offer through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(price);
    const repository = new PricingRepository(createPrismaMock({ findFirst }));
    const now = new Date("2026-06-01T00:00:00.000Z");

    const result = await repository.findActiveByOffer(offer.id, now);

    expect(result).toEqual(price);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        offerId: offer.id,
        status: PRICE_STATUS_ACTIVE,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
      orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
    });
  });

  it("archives a price through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...price,
      status: PRICE_STATUS_ARCHIVED,
    });
    const repository = new PricingRepository(createPrismaMock({ update }));

    const result = await repository.archive(price.id);

    expect(result.status).toBe(PRICE_STATUS_ARCHIVED);
    expect(update).toHaveBeenCalledWith({
      where: { id: price.id },
      data: { status: PRICE_STATUS_ARCHIVED },
    });
  });
});

function createPrismaMock(methods: {
  offerFindUnique?: jest.Mock;
  create?: jest.Mock;
  update?: jest.Mock;
  findUnique?: jest.Mock;
  findMany?: jest.Mock;
  findFirst?: jest.Mock;
}): PrismaService {
  const prisma = {
    offer: {
      findUnique: methods.offerFindUnique ?? jest.fn(),
    },
    price: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
