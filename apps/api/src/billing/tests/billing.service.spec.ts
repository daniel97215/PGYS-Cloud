import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InvoiceStatus, Prisma } from "@prisma/client";
import {
  BILLING_INVOICE_STATUSES,
  BILLING_PERIODS,
} from "../billing.constants";
import { BillingRepository } from "../billing.repository";
import { BillingService } from "../billing.service";

describe("BillingService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const subscriptionId = "20000000-0000-4000-8000-000000000001";
  const invoiceId = "30000000-0000-4000-8000-000000000001";
  const periodStart = new Date("2026-08-01T00:00:00.000Z");
  const dueAt = new Date("2026-08-15T00:00:00.000Z");
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
    status: "ACTIVE",
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
    createdAt: periodStart,
    updatedAt: periodStart,
    closedAt: null,
  };
  const subscription = {
    id: subscriptionId,
    workspaceId,
    offerId: "40000000-0000-4000-8000-000000000001",
    priceId: "50000000-0000-4000-8000-000000000001",
    status: "active",
    startedAt: periodStart,
    endsAt: null,
    cancelledAt: null,
    renewalDate: null,
    createdAt: periodStart,
    updatedAt: periodStart,
    offer: {
      id: "40000000-0000-4000-8000-000000000001",
      key: "crm-starter",
      name: "CRM Starter",
      description: null,
      status: "active",
      visibility: "public",
      createdAt: periodStart,
      updatedAt: periodStart,
    },
    price: {
      id: "50000000-0000-4000-8000-000000000001",
      offerId: "40000000-0000-4000-8000-000000000001",
      currency: "EUR",
      amount: new Prisma.Decimal(100),
      billingPeriod: "monthly",
      validFrom: periodStart,
      validTo: null,
      status: "active",
      createdAt: periodStart,
      updatedAt: periodStart,
    },
  };
  const invoice = {
    id: invoiceId,
    workspaceId,
    subscriptionId,
    number: "INV-000001",
    status: InvoiceStatus.DRAFT,
    billingPeriod: BILLING_PERIODS.MONTHLY,
    periodStart,
    periodEnd: new Date("2026-09-01T00:00:00.000Z"),
    subtotalAmount: new Prisma.Decimal(100),
    discountAmount: new Prisma.Decimal(10),
    taxAmount: new Prisma.Decimal(18),
    totalAmount: new Prisma.Decimal(108),
    currency: "EUR",
    billingDetails: { name: "Acme" },
    issuedAt: periodStart,
    dueAt,
    paidAt: null,
    createdAt: periodStart,
    updatedAt: periodStart,
    lines: [],
  };

  let repository: jest.Mocked<BillingRepository>;
  let service: BillingService;

  beforeEach(() => {
    repository = {
      findWorkspaceById: jest.fn().mockResolvedValue(workspace),
      findSubscriptionById: jest.fn().mockResolvedValue(subscription),
      findTaxByCode: jest.fn().mockResolvedValue({
        id: "60000000-0000-4000-8000-000000000001",
        workspaceId,
        code: "VAT20",
        name: "TVA 20%",
        rate: new Prisma.Decimal(20),
        isDefault: true,
        isActive: true,
        createdAt: periodStart,
        updatedAt: periodStart,
      }),
      findByPeriod: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(invoice),
      list: jest.fn(),
      create: jest.fn().mockResolvedValue(invoice),
      transition: jest.fn(),
    } as unknown as jest.Mocked<BillingRepository>;
    service = new BillingService(repository);
  });

  it("creates a monthly invoice with immutable price, discount and tax snapshots", async () => {
    await service.create(workspaceId, {
      subscriptionId,
      periodStart,
      dueAt,
      taxCode: "VAT20",
      discountRate: 10,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        subscriptionId,
        billingPeriod: BILLING_PERIODS.MONTHLY,
        periodEnd: new Date("2026-09-01T00:00:00.000Z"),
        subtotalAmount: 100,
        discountAmount: 10,
        taxAmount: 18,
        totalAmount: 108,
        currency: "EUR",
        billingDetails: expect.objectContaining({
          legalName: "Acme SAS",
          vatNumber: "FR00123456789",
        }),
        line: expect.objectContaining({
          unitPrice: 100,
          discountRate: 10,
          taxCode: "VAT20",
          taxRate: 20,
          totalAmount: 108,
        }),
      }),
    );
  });

  it("calculates an annual period from a yearly price alias", async () => {
    repository.findSubscriptionById.mockResolvedValue({
      ...subscription,
      price: { ...subscription.price, billingPeriod: "yearly" },
    });

    await service.create(workspaceId, {
      subscriptionId,
      periodStart,
      dueAt,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        billingPeriod: BILLING_PERIODS.ANNUAL,
        periodEnd: new Date("2027-08-01T00:00:00.000Z"),
      }),
    );
  });

  it("rejects a subscription from another workspace", async () => {
    repository.findSubscriptionById.mockResolvedValue({
      ...subscription,
      workspaceId: "90000000-0000-4000-8000-000000000001",
    });

    await expect(
      service.create(workspaceId, { subscriptionId, periodStart, dueAt }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects an already billed subscription period", async () => {
    repository.findByPeriod.mockResolvedValue(invoice);

    await expect(
      service.create(workspaceId, { subscriptionId, periodStart, dueAt }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects unsupported billing periods and inactive taxes", async () => {
    repository.findSubscriptionById.mockResolvedValue({
      ...subscription,
      price: { ...subscription.price, billingPeriod: "weekly" },
    });
    await expect(
      service.create(workspaceId, { subscriptionId, periodStart, dueAt }),
    ).rejects.toBeInstanceOf(BadRequestException);

    repository.findSubscriptionById.mockResolvedValue(subscription);
    repository.findTaxByCode.mockResolvedValue({
      id: "60000000-0000-4000-8000-000000000001",
      workspaceId,
      code: "VAT20",
      name: "TVA 20%",
      rate: new Prisma.Decimal(20),
      isDefault: true,
      isActive: false,
      createdAt: periodStart,
      updatedAt: periodStart,
    });
    await expect(
      service.create(workspaceId, {
        subscriptionId,
        periodStart,
        dueAt,
        taxCode: "VAT20",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("opens a draft and marks an open invoice paid", async () => {
    repository.transition.mockResolvedValue({
      ...invoice,
      status: InvoiceStatus.OPEN,
    });
    await service.open(workspaceId, invoiceId);
    expect(repository.transition).toHaveBeenCalledWith(
      workspaceId,
      invoiceId,
      BILLING_INVOICE_STATUSES.DRAFT,
      BILLING_INVOICE_STATUSES.OPEN,
      undefined,
    );

    repository.findById.mockResolvedValue({
      ...invoice,
      status: InvoiceStatus.OPEN,
    });
    repository.transition.mockResolvedValue({
      ...invoice,
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
    });
    await service.markPaid(workspaceId, invoiceId);
    expect(repository.transition).toHaveBeenLastCalledWith(
      workspaceId,
      invoiceId,
      BILLING_INVOICE_STATUSES.OPEN,
      BILLING_INVOICE_STATUSES.PAID,
      expect.any(Date),
    );
  });

  it("keeps paid and void invoices immutable", async () => {
    repository.findById.mockResolvedValue({
      ...invoice,
      status: InvoiceStatus.PAID,
    });

    await expect(service.void(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.transition).not.toHaveBeenCalled();
  });
});
