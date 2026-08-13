import { CheckoutStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CHECKOUT_BILLING_PERIODS } from "../checkout.constants";
import { CheckoutRepository } from "../checkout.repository";

describe("CheckoutRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const checkoutId = "20000000-0000-4000-8000-000000000001";
  const offerId = "30000000-0000-4000-8000-000000000001";
  const priceId = "40000000-0000-4000-8000-000000000001";
  const now = new Date("2026-08-13T10:00:00.000Z");
  const periodEnd = new Date("2026-09-13T10:00:00.000Z");
  const checkout = {
    id: checkoutId,
    workspaceId,
    offerId,
    priceId,
    subscriptionId: null,
    invoiceId: null,
    idempotencyKey: "request-1",
    status: CheckoutStatus.OPEN,
    amount: 12,
    currency: "EUR",
    billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
    expiresAt: periodEnd,
    completedAt: null,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
    subscription: null,
    invoice: null,
  };

  let prisma: {
    checkoutSession: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      upsert: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
    };
    workspace: { findUnique: jest.Mock };
    price: { findFirst: jest.Mock };
    subscription: { findFirst: jest.Mock; create: jest.Mock };
    invoiceNumberSequence: { upsert: jest.Mock };
    invoice: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let repository: CheckoutRepository;

  beforeEach(() => {
    prisma = {
      checkoutSession: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      workspace: { findUnique: jest.fn() },
      price: { findFirst: jest.fn() },
      subscription: { findFirst: jest.fn(), create: jest.fn() },
      invoiceNumberSequence: { upsert: jest.fn() },
      invoice: { create: jest.fn() },
      $transaction: jest.fn(async (callback) => callback(prisma)),
    };
    repository = new CheckoutRepository(prisma as unknown as PrismaService);
  });

  it("creates idempotently within a workspace", async () => {
    prisma.checkoutSession.upsert.mockResolvedValue(checkout);

    await repository.create({
      workspaceId,
      offerId,
      priceId,
      idempotencyKey: "request-1",
      amount: 12,
      currency: "EUR",
      billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
      expiresAt: periodEnd,
    });

    expect(prisma.checkoutSession.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workspaceId_idempotencyKey: {
            workspaceId,
            idempotencyKey: "request-1",
          },
        },
        update: {},
      }),
    );
  });

  it("expires only open checkouts from the requested workspace", async () => {
    prisma.checkoutSession.updateMany.mockResolvedValue({ count: 1 });

    await repository.expireOpen(workspaceId, now);

    expect(prisma.checkoutSession.updateMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        status: CheckoutStatus.OPEN,
        expiresAt: { lte: now },
      },
      data: { status: CheckoutStatus.EXPIRED },
    });
  });

  it("creates the subscription and invoice in the claimed checkout transaction", async () => {
    prisma.checkoutSession.updateMany.mockResolvedValue({ count: 1 });
    prisma.subscription.create.mockResolvedValue({ id: "subscription-id" });
    prisma.invoiceNumberSequence.upsert.mockResolvedValue({ nextValue: 2 });
    prisma.invoice.create.mockResolvedValue({ id: "invoice-id" });
    prisma.checkoutSession.update.mockResolvedValue({
      ...checkout,
      status: CheckoutStatus.COMPLETED,
    });

    await repository.complete({
      workspaceId,
      checkoutId,
      offerId,
      priceId,
      completedAt: now,
      periodEnd,
      amount: 12,
      currency: "EUR",
      billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
      offerName: "Essentiel",
      billingDetails: { name: "Acme" },
    });

    expect(prisma.checkoutSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId, status: CheckoutStatus.OPEN }),
      }),
    );
    expect(prisma.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ workspaceId, offerId, priceId, status: "active" }),
    });
    expect(prisma.invoice.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId,
        subscriptionId: "subscription-id",
        number: "INV-000001",
        totalAmount: 12,
        lines: { create: expect.objectContaining({ unitPrice: 12 }) },
      }),
    });
    expect(prisma.checkoutSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { subscriptionId: "subscription-id", invoiceId: "invoice-id" },
      }),
    );
  });

  it("does not create commercial records when checkout claiming fails", async () => {
    prisma.checkoutSession.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.complete({
        workspaceId,
        checkoutId,
        offerId,
        priceId,
        completedAt: now,
        periodEnd,
        amount: 12,
        currency: "EUR",
        billingPeriod: CHECKOUT_BILLING_PERIODS.MONTHLY,
        offerName: "Essentiel",
        billingDetails: { name: "Acme" },
      }),
    ).resolves.toBeNull();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.invoice.create).not.toHaveBeenCalled();
  });
});
