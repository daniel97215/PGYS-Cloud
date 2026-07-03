import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionsRepository,
} from "../subscriptions.repository";
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
    status: "draft",
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
    } as unknown as jest.Mocked<SubscriptionsRepository>;

    service = new SubscriptionsService(repository);
  });

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

    expect(repository.update).toHaveBeenCalledWith(subscription.id, {
      status: SUBSCRIPTION_STATUSES.SUSPENDED,
    });
  });

  it("reactivates a subscription", async () => {
    const renewalDate = new Date("2026-03-01T00:00:00.000Z");

    await service.reactivateSubscription(subscription.id, { renewalDate });

    expect(repository.update).toHaveBeenCalledWith(subscription.id, {
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      startedAt: subscription.startedAt,
      endsAt: undefined,
      cancelledAt: null,
      renewalDate,
    });
  });

  it("cancels a subscription", async () => {
    const cancelledAt = new Date("2026-06-01T00:00:00.000Z");

    await service.cancelSubscription(subscription.id, { cancelledAt });

    expect(repository.update).toHaveBeenCalledWith(subscription.id, {
      status: SUBSCRIPTION_STATUSES.CANCELLED,
      cancelledAt,
      endsAt: cancelledAt,
    });
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
        status: "trial",
        startedAt: subscription.startedAt,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws BadRequestException when workspace id is blank", async () => {
    await expect(service.getActiveSubscription(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
