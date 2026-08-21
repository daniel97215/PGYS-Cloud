import { NotFoundException } from "@nestjs/common";
import { PlatformOperatorRole, Prisma } from "@prisma/client";
import { PlatformSubscriptionsRepository } from "../platform-subscriptions.repository";
import { PlatformSubscriptionsService } from "../platform-subscriptions.service";

describe("PlatformSubscriptionsService", () => {
  let repository: jest.Mocked<PlatformSubscriptionsRepository>;
  let service: PlatformSubscriptionsService;

  const subscription = {
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

  beforeEach(() => {
    repository = {
      search: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<PlatformSubscriptionsRepository>;
    service = new PlatformSubscriptionsService(repository);
  });

  it("maps prices to explicit decimal strings", async () => {
    repository.search.mockResolvedValue({
      items: [subscription],
      total: 1,
      page: 1,
      pageSize: 25,
    });

    const result = await service.search(
      {},
      PlatformOperatorRole.PLATFORM_SUPPORT,
    );

    expect(result.accessRole).toBe(PlatformOperatorRole.PLATFORM_SUPPORT);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: subscription.id,
        price: expect.objectContaining({ amount: "49.90" }),
      }),
    );
  });

  it("rejects an unknown subscription", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getOne(subscription.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
