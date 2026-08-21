import { PrismaService } from "../../prisma/prisma.service";
import { OFFER_STATUS_ARCHIVED } from "../offers.constants";
import { OffersRepository } from "../offers.repository";

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
    const count = jest.fn().mockResolvedValue(1);
    const repository = new OffersRepository(
      createPrismaMock({ count, findMany }),
    );

    const result = await repository.findPage({ page: 2, pageSize: 10 });

    expect(result).toEqual({
      items: [offer],
      total: 1,
      page: 2,
      pageSize: 10,
    });
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
      skip: 10,
      take: 10,
    });
    expect(count).toHaveBeenCalledWith();
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

  it("finds an offer by id through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(offer);
    const repository = new OffersRepository(createPrismaMock({ findUnique }));

    await expect(repository.findById(offer.id)).resolves.toEqual(offer);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: offer.id } });
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

  it("detects usage from subscriptions or checkouts", async () => {
    const subscriptionCount = jest.fn().mockResolvedValue(0);
    const checkoutCount = jest.fn().mockResolvedValue(1);
    const repository = new OffersRepository(
      createPrismaMock({ subscriptionCount, checkoutCount }),
    );

    await expect(repository.hasUsage(offer.id)).resolves.toBe(true);
    expect(subscriptionCount).toHaveBeenCalledWith({ where: { offerId: offer.id } });
    expect(checkoutCount).toHaveBeenCalledWith({ where: { offerId: offer.id } });
  });

  it("applies lifecycle transitions with the current status guard", async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const findUnique = jest.fn().mockResolvedValue({ ...offer, status: "active" });
    const repository = new OffersRepository(
      createPrismaMock({ updateMany, findUnique }),
    );

    await expect(repository.transition(offer.id, "draft", "active")).resolves.toEqual(
      expect.objectContaining({ status: "active" }),
    );
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: offer.id, status: "draft" },
      data: { status: "active" },
    });
  });
});

function createPrismaMock(methods: {
  count?: jest.Mock;
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
  updateMany?: jest.Mock;
  subscriptionCount?: jest.Mock;
  checkoutCount?: jest.Mock;
}): PrismaService {
  const prisma = {
    offer: {
      count: methods.count ?? jest.fn(),
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      updateMany: methods.updateMany ?? jest.fn(),
    },
    subscription: { count: methods.subscriptionCount ?? jest.fn() },
    checkoutSession: { count: methods.checkoutCount ?? jest.fn() },
  };
  Object.assign(prisma, {
    $transaction: jest.fn(async (input: unknown) =>
      Array.isArray(input) ? Promise.all(input) : (input as (tx: typeof prisma) => unknown)(prisma),
    ),
  });

  return prisma as unknown as PrismaService;
}
