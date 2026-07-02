import { PrismaService } from "../../prisma/prisma.service";
import { OFFER_STATUS_ARCHIVED, OffersRepository } from "../offers.repository";

describe("OffersRepository", () => {
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

  it("creates an offer through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(offer);
    const repository = new OffersRepository(createPrismaMock({ create }));

    const result = await repository.create({
      key: offer.key,
      name: offer.name,
      description: offer.description,
    });

    expect(result).toEqual(offer);
    expect(create).toHaveBeenCalledWith({
      data: {
        key: offer.key,
        name: offer.name,
        description: offer.description,
      },
    });
  });

  it("updates an offer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(offer);
    const repository = new OffersRepository(createPrismaMock({ update }));

    const result = await repository.update(offer.key, {
      name: "CRM Pro",
    });

    expect(result).toEqual(offer);
    expect(update).toHaveBeenCalledWith({
      where: { key: offer.key },
      data: { name: "CRM Pro" },
    });
  });

  it("lists offers through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([offer]);
    const repository = new OffersRepository(createPrismaMock({ findMany }));

    const result = await repository.findAll();

    expect(result).toEqual([offer]);
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
    });
  });

  it("finds an offer by key through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(offer);
    const repository = new OffersRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByKey(offer.key);

    expect(result).toEqual(offer);
    expect(findUnique).toHaveBeenCalledWith({
      where: { key: offer.key },
    });
  });

  it("archives an offer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...offer,
      status: OFFER_STATUS_ARCHIVED,
    });
    const repository = new OffersRepository(createPrismaMock({ update }));

    const result = await repository.archive(offer.key);

    expect(result.status).toBe(OFFER_STATUS_ARCHIVED);
    expect(update).toHaveBeenCalledWith({
      where: { key: offer.key },
      data: { status: OFFER_STATUS_ARCHIVED },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    offer: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
