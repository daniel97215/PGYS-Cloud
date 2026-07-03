import { PrismaService } from "../../prisma/prisma.service";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionsRepository,
} from "../subscriptions.repository";

describe("SubscriptionsRepository", () => {
  const workspace = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Acme",
    displayName: "Acme",
    slug: "acme",
    status: "ACTIVE",
    billingEmail: null,
    locale: "fr-FR",
    timezone: "Europe/Paris",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    closedAt: null,
  };

  const offer = {
    id: "10000000-0000-4000-8000-000000000002",
    key: "crm-starter",
    name: "CRM Starter",
    description: "Entry CRM offer",
    status: "draft",
    visibility: "public",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const price = {
    id: "10000000-0000-4000-8000-000000000003",
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

  const subscription = {
    id: "10000000-0000-4000-8000-000000000004",
    workspaceId: workspace.id,
    offerId: offer.id,
    priceId: price.id,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: null,
    cancelledAt: null,
    renewalDate: new Date("2026-02-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("finds workspace by id through Prisma", async () => {
    const workspaceFindUnique = jest.fn().mockResolvedValue(workspace);
    const repository = new SubscriptionsRepository(
      createPrismaMock({ workspaceFindUnique }),
    );

    const result = await repository.findWorkspaceById(workspace.id);

    expect(result).toEqual(workspace);
    expect(workspaceFindUnique).toHaveBeenCalledWith({
      where: { id: workspace.id },
    });
  });

  it("finds offer by key through Prisma", async () => {
    const offerFindUnique = jest.fn().mockResolvedValue(offer);
    const repository = new SubscriptionsRepository(
      createPrismaMock({ offerFindUnique }),
    );

    const result = await repository.findOfferByKey(offer.key);

    expect(result).toEqual(offer);
    expect(offerFindUnique).toHaveBeenCalledWith({
      where: { key: offer.key },
    });
  });

  it("finds price by id through Prisma", async () => {
    const priceFindUnique = jest.fn().mockResolvedValue(price);
    const repository = new SubscriptionsRepository(
      createPrismaMock({ priceFindUnique }),
    );

    const result = await repository.findPriceById(price.id);

    expect(result).toEqual(price);
    expect(priceFindUnique).toHaveBeenCalledWith({
      where: { id: price.id },
    });
  });

  it("creates a subscription through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(subscription);
    const repository = new SubscriptionsRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId: workspace.id,
      offerId: offer.id,
      priceId: price.id,
      status: subscription.status,
      startedAt: subscription.startedAt,
      renewalDate: subscription.renewalDate,
    });

    expect(result).toEqual(subscription);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId: workspace.id,
        offerId: offer.id,
        priceId: price.id,
        status: subscription.status,
        startedAt: subscription.startedAt,
        renewalDate: subscription.renewalDate,
      },
    });
  });

  it("finds an active subscription by workspace through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(subscription);
    const repository = new SubscriptionsRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findActiveByWorkspace(workspace.id);

    expect(result).toEqual(subscription);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: workspace.id,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
      },
      orderBy: { startedAt: "desc" },
    });
  });

  it("finds an active subscription by workspace and offer through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(subscription);
    const repository = new SubscriptionsRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findActiveByWorkspaceAndOffer(
      workspace.id,
      offer.id,
    );

    expect(result).toEqual(subscription);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: workspace.id,
        offerId: offer.id,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
      },
      orderBy: { startedAt: "desc" },
    });
  });

  it("lists subscriptions by workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([subscription]);
    const repository = new SubscriptionsRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.listByWorkspace(workspace.id);

    expect(result).toEqual([subscription]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId: workspace.id },
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
    });
  });

  it("updates a subscription through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(subscription);
    const repository = new SubscriptionsRepository(createPrismaMock({ update }));

    const result = await repository.update(subscription.id, {
      status: SUBSCRIPTION_STATUSES.SUSPENDED,
    });

    expect(result).toEqual(subscription);
    expect(update).toHaveBeenCalledWith({
      where: { id: subscription.id },
      data: { status: SUBSCRIPTION_STATUSES.SUSPENDED },
    });
  });
});

function createPrismaMock(methods: {
  workspaceFindUnique?: jest.Mock;
  offerFindUnique?: jest.Mock;
  priceFindUnique?: jest.Mock;
  subscriptionFindUnique?: jest.Mock;
  findFirst?: jest.Mock;
  findMany?: jest.Mock;
  create?: jest.Mock;
  update?: jest.Mock;
}): PrismaService {
  const prisma = {
    workspace: {
      findUnique: methods.workspaceFindUnique ?? jest.fn(),
    },
    offer: {
      findUnique: methods.offerFindUnique ?? jest.fn(),
    },
    price: {
      findUnique: methods.priceFindUnique ?? jest.fn(),
    },
    subscription: {
      findUnique: methods.subscriptionFindUnique ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
