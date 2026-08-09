import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  SalesPaymentMethod,
  SalesPaymentStatus,
} from "@prisma/client";
import {
  SalesPaymentAllocationExceedsBalanceError,
  SalesPaymentAllocationMismatchError,
  SalesPaymentsRepository,
} from "../sales-payments.repository";
import { SalesPaymentsService } from "../sales-payments.service";

describe("SalesPaymentsService", () => {
  let repository: jest.Mocked<SalesPaymentsRepository>;
  let service: SalesPaymentsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const paymentId = "20000000-0000-4000-8000-000000000001";
  const partnerId = "30000000-0000-4000-8000-000000000001";
  const invoiceId = "40000000-0000-4000-8000-000000000001";
  const allocationId = "50000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(payment()),
      findById: jest.fn().mockResolvedValue(payment()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      findByInvoice: jest.fn().mockResolvedValue([]),
      addAllocation: jest.fn().mockResolvedValue(payment()),
      removeAllocation: jest.fn().mockResolvedValue(payment()),
      confirm: jest
        .fn()
        .mockResolvedValue(payment(SalesPaymentStatus.CONFIRMED)),
      cancel: jest
        .fn()
        .mockResolvedValue(payment(SalesPaymentStatus.CANCELLED)),
      findBusinessPartner: jest.fn().mockResolvedValue({ id: partnerId }),
    } as unknown as jest.Mocked<SalesPaymentsRepository>;
    service = new SalesPaymentsService(repository);
  });

  it("creates a normalized draft payment with a server Decimal", async () => {
    await service.create(workspaceId, {
      number: " pay-001 ",
      businessPartnerId: partnerId,
      method: SalesPaymentMethod.BANK_TRANSFER,
      amount: 100.25,
      currencyCode: " eur ",
      paymentDate: "2026-08-05T00:00:00.000Z",
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "PAY-001",
      businessPartnerId: partnerId,
      method: SalesPaymentMethod.BANK_TRANSFER,
      amount: new Prisma.Decimal(100.25),
      currencyCode: "EUR",
      paymentDate: new Date("2026-08-05T00:00:00.000Z"),
    });
  });

  it("rejects a business partner outside the workspace", async () => {
    repository.findBusinessPartner.mockResolvedValueOnce(null);

    await expect(
      service.create(workspaceId, {
        number: "PAY-001",
        businessPartnerId: partnerId,
        method: SalesPaymentMethod.CASH,
        amount: 10,
        currencyCode: "EUR",
        paymentDate: "2026-08-05T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects a non-positive amount even outside DTO validation", async () => {
    await expect(
      service.create(workspaceId, {
        number: "PAY-001",
        businessPartnerId: partnerId,
        method: SalesPaymentMethod.CASH,
        amount: 0,
        currencyCode: "EUR",
        paymentDate: "2026-08-05T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("adds a positive allocation to a draft payment", async () => {
    await service.addAllocation(workspaceId, paymentId, {
      salesInvoiceId: invoiceId,
      amount: 40,
    });

    expect(repository.addAllocation).toHaveBeenCalledWith({
      workspaceId,
      salesPaymentId: paymentId,
      salesInvoiceId: invoiceId,
      amount: new Prisma.Decimal(40),
    });
  });

  it("maps an invoice overpayment to a bad request", async () => {
    repository.addAllocation.mockRejectedValueOnce(
      new SalesPaymentAllocationExceedsBalanceError(),
    );

    await expect(
      service.addAllocation(workspaceId, paymentId, {
        salesInvoiceId: invoiceId,
        amount: 101,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("keeps confirmed payments immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      payment(SalesPaymentStatus.CONFIRMED),
    );

    await expect(
      service.removeAllocation(
        workspaceId,
        paymentId,
        allocationId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.removeAllocation).not.toHaveBeenCalled();
  });

  it("confirms a draft payment through the transactional repository", async () => {
    const result = await service.confirm(workspaceId, paymentId);

    expect(result.status).toBe(SalesPaymentStatus.CONFIRMED);
    expect(repository.confirm).toHaveBeenCalledWith(workspaceId, paymentId);
  });

  it("rejects confirmation when allocated total differs", async () => {
    repository.confirm.mockRejectedValueOnce(
      new SalesPaymentAllocationMismatchError(),
    );

    await expect(
      service.confirm(workspaceId, paymentId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("does not cancel a confirmed payment", async () => {
    repository.findById.mockResolvedValueOnce(
      payment(SalesPaymentStatus.CONFIRMED),
    );

    await expect(service.cancel(workspaceId, paymentId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.cancel).not.toHaveBeenCalled();
  });

  it("preserves workspace isolation when loading a payment", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, paymentId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("lists invoice payments through the workspace-scoped repository", async () => {
    await service.listByInvoice(workspaceId, invoiceId);

    expect(repository.findByInvoice).toHaveBeenCalledWith(
      workspaceId,
      invoiceId,
    );
  });

  function payment(status: SalesPaymentStatus = SalesPaymentStatus.DRAFT) {
    return {
      id: paymentId,
      workspaceId,
      number: "PAY-001",
      businessPartnerId: partnerId,
      status,
      method: SalesPaymentMethod.BANK_TRANSFER,
      amount: new Prisma.Decimal(100.25),
      currencyCode: "EUR",
      paymentDate: new Date("2026-08-05T00:00:00.000Z"),
      externalReference: null,
      notes: null,
      confirmedAt:
        status === SalesPaymentStatus.CONFIRMED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      cancelledAt:
        status === SalesPaymentStatus.CANCELLED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      allocations: [],
    };
  }
});
