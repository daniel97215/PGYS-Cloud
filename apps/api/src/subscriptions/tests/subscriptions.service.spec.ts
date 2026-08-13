import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { SUBSCRIPTION_STATUSES } from "../subscriptions.constants";
import { SubscriptionsRepository } from "../subscriptions.repository";
import { SubscriptionsService } from "../subscriptions.service";

describe("SubscriptionsService", () => {
  let repository: jest.Mocked<SubscriptionsRepository>;
  let service: SubscriptionsService;

  const workspace = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Acme",
  };

  const offer = {
    id: "10000000-0000-4000-8000-000000000002",
    key: "crm-starter",
    name: "CRM Starter",
    description: "Entry CRM offer",
    status: "active",
    visibility: "public",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const nextOffer = {
    ...offer,
    id: "10000000-0000-4000-8000-000000000005",
    key: "crm-pro",
    name: "CRM Pro",
  };

  const price = {
    id: "10000000-0000-4000-8000-000000000003",
    offerId: offer.id,
    currency: "EUR",
    amount: new Prisma.Decimal(29.99),
    billingPeriod: "monthly",
    validFrom: new Date("2025-01-01T00:00:00.000Z"),
    validTo: null,
    status: "active",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
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

  beforeEach(() => {
    repository = {
      findWorkspaceById: jest.fn().mockResolvedValue(workspace),
      findOfferByKey: jest.fn().mockResolvedValue(offer),
      findPriceById: jest.fn().mockResolvedValue(price),
      findById: jest.fn().mockResolvedValue(subscription),
      findActiveByWorkspace: jest.fn().mockResolvedValue(subscription),
      findActiveByWorkspaceAndOffer: jest.fn().mockResolvedValue(null),
      listByWorkspace: jest.fn().mockResolvedValue([subscription]),
      create: jest.fn().mockResolvedValue(subscription),
      update: jest.fn().mockResolvedValue(subscription),
      transition: jest.fn().mockImplementation(
        async (_id, _current, status, data) => ({
          ...subscription,
          ...data,
          status,
        }),
      ),
    } as unknown as jest.Mocked<SubscriptionsRepository>;

    service = new SubscriptionsService(repository);
  });

  afterEach(() => jest.useRealTimers());

  it("creates a subscription", async () => {
    const result = await service.createSubscription({
      workspaceId: workspace.id,
      offerKey: "CRM-Starter",
      priceId: price.id,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      startedAt: subscription.startedAt,
      renewalDate: subscription.renewalDate ?? undefined,
    });

    expect(result).toEqual(subscription);
    expect(repository.findWorkspaceById).toHaveBeenCalledWith(workspace.id);
    expect(repository.findOfferByKey).toHaveBeenCalledWith(offer.key);
    expect(repository.findPriceById).toHaveBeenCalledWith(price.id);
    expect(repository.findActiveByWorkspaceAndOffer).toHaveBeenCalledWith(
      workspace.id,
      offer.id,
    );
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId: workspace.id,
      offerId: offer.id,
      priceId: price.id,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      startedAt: subscription.startedAt,
      endsAt: undefined,
      renewalDate: subscription.renewalDate,
    });
  });

  it("gets the active subscription for a workspace", async () => {
    const result = await service.getActiveSubscription(workspace.id);

    expect(result).toEqual(subscription);
    expect(repository.findActiveByWorkspace).toHaveBeenCalledWith(workspace.id);
  });

  it("lists subscriptions for a workspace", async () => {
    const result = await service.listWorkspaceSubscriptions(workspace.id);

    expect(result).toEqual([subscription]);
    expect(repository.listByWorkspace).toHaveBeenCalledWith(workspace.id);
  });

  it("changes the offer", async () => {
    repository.findOfferByKey.mockResolvedValueOnce(nextOffer);
    repository.findPriceById.mockResolvedValueOnce({
      ...price,
      offerId: nextOffer.id,
    });

    const result = await service.changeOffer(subscription.id, {
      offerKey: nextOffer.key,
      priceId: price.id,
      renewalDate: subscription.renewalDate ?? undefined,
    });

    expect(result).toEqual(subscription);
    expect(repository.update).toHaveBeenCalledWith(subscription.id, {
      offerId: nextOffer.id,
      priceId: price.id,
      renewalDate: subscription.renewalDate,
    });
  });

  it("suspends a subscription", async () => {
    await service.suspendSubscription(subscription.id);

    expect(repository.transition).toHaveBeenCalledWith(
      subscription.id,
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.SUSPENDED,
      {},
    );
  });

  it("reactivates a subscription", async () => {
    const renewalDate = new Date("2026-03-01T00:00:00.000Z");
    repository.findById.mockResolvedValue({
      ...subscription,
      status: SUBSCRIPTION_STATUSES.SUSPENDED,
    });

    await service.reactivateSubscription(subscription.id, { renewalDate });

    expect(repository.transition).toHaveBeenCalledWith(
      subscription.id,
      SUBSCRIPTION_STATUSES.SUSPENDED,
      SUBSCRIPTION_STATUSES.ACTIVE,
      {
        startedAt: subscription.startedAt,
        endsAt: undefined,
        cancelledAt: null,
        renewalDate,
      },
    );
  });

  it("cancels a subscription", async () => {
    const cancelledAt = new Date("2026-06-01T00:00:00.000Z");

    await service.cancelSubscription(subscription.id, { cancelledAt });

    expect(repository.transition).toHaveBeenCalledWith(
      subscription.id,
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.CANCELLED,
      { cancelledAt, endsAt: cancelledAt },
    );
  });

  it("throws ConflictException when an active duplicate exists", async () => {
    repository.findActiveByWorkspaceAndOffer.mockResolvedValueOnce({
      ...subscription,
      id: "10000000-0000-4000-8000-000000000099",
    });

    await expect(
      service.createSubscription({
        workspaceId: workspace.id,
        offerKey: offer.key,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        startedAt: subscription.startedAt,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("throws NotFoundException when workspace is unknown", async () => {
    repository.findWorkspaceById.mockResolvedValueOnce(null);

    await expect(service.listWorkspaceSubscriptions(workspace.id)).rejects
      .toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when subscription is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.suspendSubscription(subscription.id)).rejects
      .toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when status is unsupported", async () => {
    await expect(
      service.createSubscription({
        workspaceId: workspace.id,
        offerKey: offer.key,
        status: "trial" as never,
        startedAt: subscription.startedAt,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws BadRequestException when workspace id is blank", async () => {
    await expect(service.getActiveSubscription(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects new subscriptions to an archived offer", async () => {
    repository.findOfferByKey.mockResolvedValue({
      ...offer,
      status: "archived",
    });
    await expect(
      service.createSubscription({
        workspaceId: workspace.id,
        offerKey: offer.key,
        priceId: price.id,
        startedAt: subscription.startedAt,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("activates a pending subscription and keeps repeated activation idempotent", async () => {
    repository.findById.mockResolvedValue({
      ...subscription,
      status: SUBSCRIPTION_STATUSES.PENDING,
    });
    await service.reactivateSubscription(subscription.id, {});
    expect(repository.transition).toHaveBeenCalledWith(
      subscription.id,
      SUBSCRIPTION_STATUSES.PENDING,
      SUBSCRIPTION_STATUSES.ACTIVE,
      expect.objectContaining({ startedAt: subscription.startedAt }),
    );

    repository.transition.mockClear();
    repository.findById.mockResolvedValue(subscription);
    await expect(
      service.reactivateSubscription(subscription.id, {
        startedAt: new Date("2030-01-01T00:00:00.000Z"),
      }),
    ).resolves.toBe(subscription);
    expect(repository.transition).not.toHaveBeenCalled();
  });

  it("keeps repeated suspension and cancellation idempotent", async () => {
    const suspended = { ...subscription, status: SUBSCRIPTION_STATUSES.SUSPENDED };
    repository.findById.mockResolvedValue(suspended);
    await expect(service.suspendSubscription(subscription.id)).resolves.toBe(
      suspended,
    );
    expect(repository.transition).not.toHaveBeenCalled();

    const cancelled = {
      ...subscription,
      status: SUBSCRIPTION_STATUSES.CANCELLED,
      cancelledAt: new Date("2026-06-01T00:00:00.000Z"),
    };
    repository.findById.mockResolvedValue(cancelled);
    await expect(
      service.cancelSubscription(subscription.id, {
        cancelledAt: new Date("2030-01-01T00:00:00.000Z"),
      }),
    ).resolves.toBe(cancelled);
    expect(repository.transition).not.toHaveBeenCalled();
  });

  it("expires non-terminal subscriptions and keeps expiry idempotent", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    await service.expireSubscription(subscription.id);
    expect(repository.transition).toHaveBeenCalledWith(
      subscription.id,
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.EXPIRED,
      { endsAt: new Date("2026-06-01T00:00:00.000Z") },
    );

    repository.transition.mockClear();
    const expired = { ...subscription, status: SUBSCRIPTION_STATUSES.EXPIRED };
    repository.findById.mockResolvedValue(expired);
    await expect(service.expireSubscription(subscription.id)).resolves.toBe(expired);
    expect(repository.transition).not.toHaveBeenCalled();
  });

  it.each([
    [SUBSCRIPTION_STATUSES.CANCELLED, "reactivate"],
    [SUBSCRIPTION_STATUSES.EXPIRED, "suspend"],
    [SUBSCRIPTION_STATUSES.CANCELLED, "expire"],
  ])("rejects terminal transition from %s through %s", async (status, action) => {
    repository.findById.mockResolvedValue({ ...subscription, status });
    const operation =
      action === "reactivate"
        ? service.reactivateSubscription(subscription.id, {})
        : action === "suspend"
          ? service.suspendSubscription(subscription.id)
          : service.expireSubscription(subscription.id);
    await expect(operation).rejects.toBeInstanceOf(ConflictException);
    expect(repository.transition).not.toHaveBeenCalled();
  });

  it("rejects offer changes on terminal subscriptions", async () => {
    repository.findById.mockResolvedValue({
      ...subscription,
      status: SUBSCRIPTION_STATUSES.CANCELLED,
    });
    await expect(
      service.changeOffer(subscription.id, { offerKey: nextOffer.key }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("rejects direct creation in a non-entry lifecycle state", async () => {
    await expect(
      service.createSubscription({
        workspaceId: workspace.id,
        offerKey: offer.key,
        startedAt: subscription.startedAt,
        status: SUBSCRIPTION_STATUSES.SUSPENDED,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
