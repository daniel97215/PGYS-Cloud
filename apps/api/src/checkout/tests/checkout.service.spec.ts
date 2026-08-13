import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { CheckoutStatus, Prisma } from "@prisma/client";
import {
  CHECKOUT_BILLING_PERIODS,
  CHECKOUT_STATUSES,
} from "../checkout.constants";
import { CheckoutRepository } from "../checkout.repository";
import { CheckoutService } from "../checkout.service";

describe("CheckoutService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const checkoutId = "20000000-0000-4000-8000-000000000001";
  const offerId = "30000000-0000-4000-8000-000000000001";
  const priceId = "40000000-0000-4000-8000-000000000001";
  const now = new Date("2026-08-13T10:00:00.000Z");
  const expiresAt = new Date("2026-08-20T10:00:00.000Z");
  const workspace = {
    id: workspaceId,
    name: "Acme",
    displayName: "Acme",
    legalName: "Acme SAS",
    siret: null,
    siren: null,
    vatNumber: "FR00123456789",
    addressLine1: "1 rue PGYS",
    addressLine2: null,
    postalCode: "75001",
    city: "Paris",
    country: "France",
    slug: "acme",
    status: "ACTIVE" as const,
    billingEmail: "billing@acme.test",
    phone: null,
    website: null,
    logoUrl: null,
    locale: "fr-FR",
    language: "fr",
    timezone: "Europe/Paris",
    currency: "EUR",
    activity: null,
    companySize: null,
    createdAt: now,
    updatedAt: now,
    closedAt: null,
  };
  const price = {
    id: priceId,
    offerId,
    currency: "eur",
    amount: new Prisma.Decimal(12),
    billingPeriod: "monthly",
    validFrom: new Date("2026-08-01T00:00:00.000Z"),
    validTo: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
    offer: {
      id: offerId,
      key: "essential",
      name: "Essentiel",
      description: null,
      status: "active",
      visibility: "public",
      createdAt: now,
      updatedAt: now,
    },
  };
  const checkout = {
    id: checkoutId,
    workspaceId,
    offerId,
    priceId,
    subscriptionId: null,
    invoiceId: null,
    idempotencyKey: "request-1",
    status: CheckoutStatus.OPEN,
    amount: new Prisma.Decimal(12),
    currency: "EUR",
    billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
    expiresAt,
    completedAt: null,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
    subscription: null,
    invoice: null,
  };

  let repository: jest.Mocked<CheckoutRepository>;
  let service: CheckoutService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    repository = {
      findWorkspaceById: jest.fn().mockResolvedValue(workspace),
      findPrice: jest.fn().mockResolvedValue(price),
      findActiveSubscription: jest.fn().mockResolvedValue(null),
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(checkout),
      list: jest.fn(),
      create: jest.fn().mockResolvedValue(checkout),
      expireOpen: jest.fn().mockResolvedValue({ count: 0 }),
      cancel: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<CheckoutRepository>;
    service = new CheckoutService(repository);
  });

  afterEach(() => jest.useRealTimers());

  it("creates a checkout from an active coherent price snapshot", async () => {
    await service.create(workspaceId, {
      offerId,
      priceId,
      idempotencyKey: "request-1",
      expiresAt,
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      offerId,
      priceId,
      idempotencyKey: "request-1",
      amount: 12,
      currency: "EUR",
      billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
      expiresAt,
    });
  });

  it("replays the same idempotency request and rejects a different one", async () => {
    repository.findByIdempotencyKey.mockResolvedValue(checkout);

    await expect(
      service.create(workspaceId, {
        offerId,
        priceId,
        idempotencyKey: "request-1",
        expiresAt,
      }),
    ).resolves.toBe(checkout);
    expect(repository.create).not.toHaveBeenCalled();

    await expect(
      service.create(workspaceId, {
        offerId,
        priceId: "50000000-0000-4000-8000-000000000001",
        idempotencyKey: "request-1",
        expiresAt,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects expired requests and inactive prices", async () => {
    await expect(
      service.create(workspaceId, {
        offerId,
        priceId,
        idempotencyKey: "request-1",
        expiresAt: now,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    repository.findPrice.mockResolvedValue({ ...price, status: "archived" });
    await expect(
      service.create(workspaceId, {
        offerId,
        priceId,
        idempotencyKey: "request-1",
        expiresAt,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("completes atomically with the frozen amount and monthly period", async () => {
    const completed = {
      ...checkout,
      status: CheckoutStatus.COMPLETED,
      subscriptionId: "50000000-0000-4000-8000-000000000001",
      invoiceId: "60000000-0000-4000-8000-000000000001",
    };
    repository.complete.mockResolvedValue(completed);

    await expect(service.complete(workspaceId, checkoutId)).resolves.toBe(
      completed,
    );
    expect(repository.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        checkoutId,
        amount: 12,
        currency: "EUR",
        billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
        completedAt: now,
        periodEnd: new Date("2026-09-13T10:00:00.000Z"),
        offerName: "Essentiel",
        billingDetails: expect.objectContaining({ legalName: "Acme SAS" }),
      }),
    );
  });

  it("makes completion idempotent and rejects duplicate active subscriptions", async () => {
    repository.findById.mockResolvedValue({
      ...checkout,
      status: CheckoutStatus.COMPLETED,
    });
    await expect(service.complete(workspaceId, checkoutId)).resolves.toEqual(
      expect.objectContaining({ status: CHECKOUT_STATUSES.COMPLETED }),
    );
    expect(repository.complete).not.toHaveBeenCalled();

    repository.findById.mockResolvedValue(checkout);
    repository.findActiveSubscription.mockResolvedValue({ id: "duplicate" } as never);
    await expect(service.complete(workspaceId, checkoutId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("does not cancel an expired checkout", async () => {
    repository.findById.mockResolvedValue({
      ...checkout,
      status: CheckoutStatus.EXPIRED,
    });

    await expect(service.cancel(workspaceId, checkoutId)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.cancel).not.toHaveBeenCalled();
  });
});
