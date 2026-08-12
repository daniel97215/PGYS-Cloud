import { InvoiceStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  BILLING_INVOICE_STATUSES,
  BILLING_PERIODS,
} from "../billing.constants";
import { BillingRepository } from "../billing.repository";

describe("BillingRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const subscriptionId = "20000000-0000-4000-8000-000000000001";
  const invoiceId = "30000000-0000-4000-8000-000000000001";
  const periodStart = new Date("2026-08-01T00:00:00.000Z");
  const periodEnd = new Date("2026-09-01T00:00:00.000Z");
  const invoice = {
    id: invoiceId,
    workspaceId,
    subscriptionId,
    number: "INV-000001",
    status: InvoiceStatus.DRAFT,
    billingPeriod: BILLING_PERIODS.MONTHLY,
    periodStart,
    periodEnd,
    subtotalAmount: 100,
    discountAmount: 10,
    taxAmount: 18,
    totalAmount: 108,
    currency: "EUR",
    billingDetails: { name: "Acme" },
    issuedAt: periodStart,
    dueAt: periodEnd,
    paidAt: null,
    createdAt: periodStart,
    updatedAt: periodStart,
    lines: [],
  };

  let prisma: {
    workspace: { findUnique: jest.Mock };
    subscription: { findUnique: jest.Mock };
    tax: { findUnique: jest.Mock };
    invoice: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    invoiceNumberSequence: { upsert: jest.Mock };
    $transaction: jest.Mock;
  };
  let repository: BillingRepository;

  beforeEach(() => {
    prisma = {
      workspace: { findUnique: jest.fn() },
      subscription: { findUnique: jest.fn() },
      tax: { findUnique: jest.fn() },
      invoice: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      invoiceNumberSequence: { upsert: jest.fn() },
      $transaction: jest.fn(async (callback) => callback(prisma)),
    };
    repository = new BillingRepository(prisma as unknown as PrismaService);
  });

  it("finds a period through the workspace-scoped composite key", async () => {
    prisma.invoice.findUnique.mockResolvedValue(invoice);

    await expect(
      repository.findByPeriod(
        workspaceId,
        subscriptionId,
        periodStart,
        periodEnd,
      ),
    ).resolves.toBe(invoice);
    expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_subscriptionId_periodStart_periodEnd: {
          workspaceId,
          subscriptionId,
          periodStart,
          periodEnd,
        },
      },
      include: { lines: { orderBy: { position: "asc" } } },
    });
  });

  it("allocates a workspace number and creates its snapshot line atomically", async () => {
    prisma.invoiceNumberSequence.upsert.mockResolvedValue({
      workspaceId,
      nextValue: 2,
    });
    prisma.invoice.create.mockResolvedValue(invoice);

    await repository.create({
      workspaceId,
      subscriptionId,
      billingPeriod: BILLING_PERIODS.MONTHLY,
      periodStart,
      periodEnd,
      subtotalAmount: 100,
      discountAmount: 10,
      taxAmount: 18,
      totalAmount: 108,
      currency: "EUR",
      billingDetails: { name: "Acme" },
      dueAt: periodEnd,
      line: {
        description: "CRM Starter - monthly",
        quantity: 1,
        unitPrice: 100,
        discountRate: 10,
        taxRate: 20,
        subtotalAmount: 100,
        discountAmount: 10,
        taxAmount: 18,
        totalAmount: 108,
      },
    });

    expect(prisma.invoiceNumberSequence.upsert).toHaveBeenCalledWith({
      where: { workspaceId },
      create: { workspaceId, nextValue: 2 },
      update: { nextValue: { increment: 1 } },
    });
    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId,
          number: "INV-000001",
          lines: {
            create: expect.objectContaining({ workspaceId, position: 1 }),
          },
        }),
      }),
    );
  });

  it("scopes transitions by workspace", async () => {
    prisma.invoice.updateMany.mockResolvedValue({ count: 1 });
    prisma.invoice.findUnique.mockResolvedValue({
      ...invoice,
      status: InvoiceStatus.OPEN,
    });

    await expect(
      repository.transition(
        workspaceId,
        invoiceId,
        BILLING_INVOICE_STATUSES.DRAFT,
        BILLING_INVOICE_STATUSES.OPEN,
      ),
    ).resolves.toEqual(expect.objectContaining({ status: InvoiceStatus.OPEN }));
    expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
      where: {
        id: invoiceId,
        workspaceId,
        status: BILLING_INVOICE_STATUSES.DRAFT,
      },
      data: { status: BILLING_INVOICE_STATUSES.OPEN, paidAt: undefined },
    });
  });

  it("returns null when a scoped transition matches no invoice", async () => {
    prisma.invoice.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.transition(
        workspaceId,
        invoiceId,
        BILLING_INVOICE_STATUSES.DRAFT,
        BILLING_INVOICE_STATUSES.VOID,
      ),
    ).resolves.toBeNull();
    expect(prisma.invoice.findUnique).not.toHaveBeenCalled();
  });
});
