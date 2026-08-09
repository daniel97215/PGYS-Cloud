import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  PurchaseInvoiceStatus,
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "@prisma/client";
import {
  PurchasePaymentExceedsBalanceError,
  PurchasePaymentInvoiceReferenceError,
  PurchasePaymentsRepository,
} from "../purchase-payments.repository";
import { PurchasePaymentsService } from "../purchase-payments.service";

describe("PurchasePaymentsService", () => {
  let repository: jest.Mocked<PurchasePaymentsRepository>;
  let service: PurchasePaymentsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const paymentId = "20000000-0000-4000-8000-000000000001";
  const invoiceId = "30000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(payment()),
      update: jest.fn().mockResolvedValue(payment()),
      findById: jest.fn().mockResolvedValue(payment()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      confirm: jest
        .fn()
        .mockResolvedValue(payment(PurchasePaymentStatus.CONFIRMED)),
      cancel: jest
        .fn()
        .mockResolvedValue(payment(PurchasePaymentStatus.CANCELLED)),
      findInvoice: jest.fn().mockResolvedValue(invoice()),
    } as unknown as jest.Mocked<PurchasePaymentsRepository>;
    service = new PurchasePaymentsService(repository);
  });

  it("creates a normalized draft payment with a Decimal amount", async () => {
    await service.create(workspaceId, createDto());

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "PP-001",
      purchaseInvoiceId: invoiceId,
      amount: new Prisma.Decimal("40.5"),
      currencyCode: "EUR",
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      paymentDate: new Date("2026-08-10T00:00:00.000Z"),
      externalReference: "BANK-42",
    });
  });

  it("rejects a non-positive amount outside DTO validation", async () => {
    await expect(
      service.create(workspaceId, { ...createDto(), amount: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects an invoice outside the workspace", async () => {
    repository.findInvoice.mockResolvedValueOnce(null);

    await expect(
      service.create(workspaceId, createDto()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("updates only draft payments", async () => {
    repository.findById.mockResolvedValueOnce(
      payment(PurchasePaymentStatus.CONFIRMED),
    );

    await expect(
      service.update(workspaceId, paymentId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("validates a replacement invoice in the same workspace", async () => {
    const replacementId = "40000000-0000-4000-8000-000000000001";

    await service.update(workspaceId, paymentId, {
      purchaseInvoiceId: replacementId,
    });

    expect(repository.findInvoice).toHaveBeenCalledWith(
      workspaceId,
      replacementId,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, paymentId, {
      purchaseInvoiceId: replacementId,
    });
  });

  it("confirms a draft payment", async () => {
    const result = await service.confirm(workspaceId, paymentId);

    expect(result.status).toBe(PurchasePaymentStatus.CONFIRMED);
    expect(repository.confirm).toHaveBeenCalledWith(workspaceId, paymentId);
  });

  it("maps an overpayment to a bad request", async () => {
    repository.confirm.mockRejectedValueOnce(
      new PurchasePaymentExceedsBalanceError(),
    );

    await expect(service.confirm(workspaceId, paymentId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("maps an unpayable or currency-mismatched invoice to a bad request", async () => {
    repository.confirm.mockRejectedValueOnce(
      new PurchasePaymentInvoiceReferenceError(),
    );

    await expect(service.confirm(workspaceId, paymentId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("refuses repeated confirmation and cancellation of confirmed payments", async () => {
    repository.findById.mockResolvedValue(
      payment(PurchasePaymentStatus.CONFIRMED),
    );

    await expect(service.confirm(workspaceId, paymentId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.cancel(workspaceId, paymentId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.confirm).not.toHaveBeenCalled();
    expect(repository.cancel).not.toHaveBeenCalled();
  });

  it("passes all list filters with workspace isolation", async () => {
    await service.list(workspaceId, {
      purchaseInvoiceId: invoiceId,
      status: PurchasePaymentStatus.CONFIRMED,
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      paymentDateFrom: "2026-08-01T00:00:00.000Z",
      paymentDateTo: "2026-08-31T00:00:00.000Z",
    });

    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId, {
      purchaseInvoiceId: invoiceId,
      status: PurchasePaymentStatus.CONFIRMED,
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      paymentDateFrom: new Date("2026-08-01T00:00:00.000Z"),
      paymentDateTo: new Date("2026-08-31T00:00:00.000Z"),
    });
  });

  it("preserves workspace isolation when loading a payment", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, paymentId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(workspaceId, paymentId);
  });

  function createDto() {
    return {
      number: " pp-001 ",
      purchaseInvoiceId: invoiceId,
      amount: 40.5,
      currencyCode: " eur ",
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      paymentDate: "2026-08-10T00:00:00.000Z",
      externalReference: "BANK-42",
    };
  }

  function payment(
    status: PurchasePaymentStatus = PurchasePaymentStatus.DRAFT,
  ) {
    return {
      id: paymentId,
      workspaceId,
      number: "PP-001",
      purchaseInvoiceId: invoiceId,
      amount: new Prisma.Decimal(40.5),
      currencyCode: "EUR",
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      status,
      paymentDate: new Date("2026-08-10T00:00:00.000Z"),
      externalReference: null,
      notes: null,
      confirmedAt:
        status === PurchasePaymentStatus.CONFIRMED
          ? new Date("2026-08-10T01:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-10T00:00:00.000Z"),
      updatedAt: new Date("2026-08-10T00:00:00.000Z"),
    };
  }

  function invoice() {
    return {
      id: invoiceId,
      workspaceId,
      number: "PI-001",
      supplierInvoiceNumber: "SUP-42",
      supplierId: "50000000-0000-4000-8000-000000000001",
      purchaseOrderId: null,
      currencyCode: "EUR",
      status: PurchaseInvoiceStatus.CONFIRMED,
      invoiceDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDate: null,
      subtotalAmount: new Prisma.Decimal(100),
      taxAmount: new Prisma.Decimal(20),
      totalAmount: new Prisma.Decimal(120),
      paidAmount: new Prisma.Decimal(0),
      notes: null,
      confirmedAt: new Date("2026-08-01T01:00:00.000Z"),
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    };
  }
});
