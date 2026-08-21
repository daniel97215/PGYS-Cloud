import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformSubscriptionsRepository } from "../platform-subscriptions.repository";

describe("PlatformSubscriptionsRepository", () => {
  it("searches subscriptions globally with closed filters", async () => {
    const items = [createSubscriptionRecord()];
    const findMany = jest.fn().mockResolvedValue(items);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new PlatformSubscriptionsRepository({
      subscription: { findMany, count },
    } as unknown as PrismaService);

    const result = await repository.search({
      search: "garage",
      status: "active",
      workspaceId: "10000000-0000-4000-8000-000000000001",
      page: 2,
      pageSize: 10,
    });

    expect(result).toEqual({ items, total: 1, page: 2, pageSize: 10 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "active",
          workspaceId: "10000000-0000-4000-8000-000000000001",
          OR: expect.any(Array),
        }),
        skip: 10,
        take: 10,
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({ status: "active" }),
    });
  });

  it("loads one subscription without a workspace scope", async () => {
    const record = createSubscriptionRecord();
    const findUnique = jest.fn().mockResolvedValue(record);
    const repository = new PlatformSubscriptionsRepository({
      subscription: { findUnique },
    } as unknown as PrismaService);

    await expect(repository.findById(record.id)).resolves.toEqual(record);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: record.id } }),
    );
  });
});

function createSubscriptionRecord() {
  return {
    id: "20000000-0000-4000-8000-000000000001",
    status: "active",
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: null,
    cancelledAt: null,
    renewalDate: new Date("2026-02-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    workspace: {
      id: "10000000-0000-4000-8000-000000000001",
      displayName: "Garage Martin",
      slug: "garage-martin",
    },
    offer: {
      id: "30000000-0000-4000-8000-000000000001",
      key: "essential",
      name: "Essentiel",
    },
    price: {
      id: "40000000-0000-4000-8000-000000000001",
      amount: new Prisma.Decimal("49.90"),
      currency: "EUR",
      billingPeriod: "monthly",
    },
  };
}
