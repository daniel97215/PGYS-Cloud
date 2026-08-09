import {
  Prisma,
  SalesInvoiceStatus,
  SalesPaymentMethod,
  SalesPaymentStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SalesPaymentAllocationExceedsBalanceError,
  SalesPaymentAllocationMismatchError,
  SalesPaymentAllocationReferenceError,
  SalesPaymentsRepository,
} from "../sales-payments.repository";

describe("SalesPaymentsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const paymentId = "20000000-0000-4000-8000-000000000001";
  const partnerId = "30000000-0000-4000-8000-000000000001";
  const invoiceId1 = "40000000-0000-4000-8000-000000000001";
  const invoiceId2 = "40000000-0000-4000-8000-000000000002";

  it("scopes invoice payment listing to the workspace", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new SalesPaymentsRepository({
      salesPayment: { findMany },
    } as unknown as PrismaService);

    await repository.findByInvoice(workspaceId, invoiceId1);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        allocations: {
          some: { workspaceId, salesInvoiceId: invoiceId1 },
        },
      },
      orderBy: [{ paymentDate: "desc" }, { number: "asc" }],
    });
  });

  it("adds an allocation only to a payable matching invoice", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      salesPayment: {
        findFirst: jest.fn().mockResolvedValue(payment()),
        findUniqueOrThrow: jest.fn().mockResolvedValue(payment()),
      },
      salesInvoice: {
        findFirst: jest.fn().mockResolvedValue(invoice(invoiceId1, 80, 20)),
      },
      salesPaymentAllocation: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amount: new Prisma.Decimal(25) },
        }),
        create,
      },
    });
    const repository = new SalesPaymentsRepository(
      createPrismaMock(transaction),
    );

    await repository.addAllocation({
      workspaceId,
      salesPaymentId: paymentId,
      salesInvoiceId: invoiceId1,
      amount: new Prisma.Decimal(50),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        salesPaymentId: paymentId,
        salesInvoiceId: invoiceId1,
        amount: new Prisma.Decimal(50),
      },
    });
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("rejects an allocation larger than the invoice balance", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      salesPayment: { findFirst: jest.fn().mockResolvedValue(payment()) },
      salesInvoice: {
        findFirst: jest.fn().mockResolvedValue(invoice(invoiceId1, 100, 90)),
      },
      salesPaymentAllocation: { aggregate: jest.fn(), create },
    });
    const repository = new SalesPaymentsRepository(
      createPrismaMock(transaction),
    );

    await expect(
      repository.addAllocation({
        workspaceId,
        salesPaymentId: paymentId,
        salesInvoiceId: invoiceId1,
        amount: new Prisma.Decimal(11),
      }),
    ).rejects.toBeInstanceOf(SalesPaymentAllocationExceedsBalanceError);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects invoices from another partner, currency or workspace", async () => {
    const transaction = transactionMock({
      salesPayment: { findFirst: jest.fn().mockResolvedValue(payment()) },
      salesInvoice: { findFirst: jest.fn().mockResolvedValue(null) },
      salesPaymentAllocation: { aggregate: jest.fn(), create: jest.fn() },
    });
    const repository = new SalesPaymentsRepository(
      createPrismaMock(transaction),
    );

    await expect(
      repository.addAllocation({
        workspaceId,
        salesPaymentId: paymentId,
        salesInvoiceId: invoiceId1,
        amount: new Prisma.Decimal(10),
      }),
    ).rejects.toBeInstanceOf(SalesPaymentAllocationReferenceError);
  });

  it("confirms a multi-invoice payment and applies paid statuses atomically", async () => {
    const allocations = [
      allocation(invoiceId1, 40),
      allocation(invoiceId2, 60),
    ];
    const updateInvoice = jest
      .fn()
      .mockResolvedValueOnce([{ id: invoiceId1 }])
      .mockResolvedValueOnce([{ id: invoiceId2 }]);
    const transaction = transactionMock({
      salesPayment: {
        updateManyAndReturn: jest.fn().mockResolvedValue([
          {
            id: paymentId,
            businessPartnerId: partnerId,
            amount: new Prisma.Decimal(100),
            currencyCode: "EUR",
          },
        ]),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(payment(SalesPaymentStatus.CONFIRMED, allocations)),
      },
      salesPaymentAllocation: {
        findMany: jest.fn().mockResolvedValue(allocations),
      },
      salesInvoice: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(invoice(invoiceId1, 100, 20))
          .mockResolvedValueOnce(invoice(invoiceId2, 60, 0)),
        updateManyAndReturn: updateInvoice,
      },
    });
    const repository = new SalesPaymentsRepository(
      createPrismaMock(transaction),
    );

    const result = await repository.confirm(workspaceId, paymentId);

    expect(result.status).toBe(SalesPaymentStatus.CONFIRMED);
    expect(updateInvoice.mock.calls[0][0].data).toEqual({
      paidAmount: new Prisma.Decimal(60),
      status: SalesInvoiceStatus.PARTIALLY_PAID,
    });
    expect(updateInvoice.mock.calls[1][0].data).toEqual({
      paidAmount: new Prisma.Decimal(60),
      status: SalesInvoiceStatus.PAID,
    });
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("rejects confirmation when allocations do not equal the payment", async () => {
    const updateInvoice = jest.fn();
    const transaction = transactionMock({
      salesPayment: {
        updateManyAndReturn: jest.fn().mockResolvedValue([
          {
            id: paymentId,
            businessPartnerId: partnerId,
            amount: new Prisma.Decimal(100),
            currencyCode: "EUR",
          },
        ]),
      },
      salesPaymentAllocation: {
        findMany: jest.fn().mockResolvedValue([allocation(invoiceId1, 99)]),
      },
      salesInvoice: { findFirst: jest.fn(), updateManyAndReturn: updateInvoice },
    });
    const repository = new SalesPaymentsRepository(
      createPrismaMock(transaction),
    );

    await expect(
      repository.confirm(workspaceId, paymentId),
    ).rejects.toBeInstanceOf(SalesPaymentAllocationMismatchError);
    expect(updateInvoice).not.toHaveBeenCalled();
  });

  function payment(
    status: SalesPaymentStatus = SalesPaymentStatus.DRAFT,
    allocations: ReturnType<typeof allocation>[] = [],
  ) {
    return {
      id: paymentId,
      workspaceId,
      number: "PAY-001",
      businessPartnerId: partnerId,
      status,
      method: SalesPaymentMethod.BANK_TRANSFER,
      amount: new Prisma.Decimal(100),
      currencyCode: "EUR",
      paymentDate: new Date("2026-08-05T00:00:00.000Z"),
      externalReference: null,
      notes: null,
      confirmedAt:
        status === SalesPaymentStatus.CONFIRMED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      cancelledAt: null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      allocations,
    };
  }

  function invoice(id: string, total: number, paid: number) {
    return {
      id,
      workspaceId,
      businessPartnerId: partnerId,
      currencyCode: "EUR",
      status:
        paid === 0
          ? SalesInvoiceStatus.ISSUED
          : SalesInvoiceStatus.PARTIALLY_PAID,
      totalAmount: new Prisma.Decimal(total),
      paidAmount: new Prisma.Decimal(paid),
    };
  }

  function allocation(salesInvoiceId: string, amount: number) {
    return {
      id: `${salesInvoiceId.slice(0, -1)}9`,
      workspaceId,
      salesPaymentId: paymentId,
      salesInvoiceId,
      amount: new Prisma.Decimal(amount),
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
    };
  }
});

function transactionMock(client: Record<string, unknown>): jest.Mock {
  return jest.fn(async (callback: (value: unknown) => unknown) =>
    callback(client),
  );
}

function createPrismaMock(transaction: jest.Mock): PrismaService {
  return { $transaction: transaction } as unknown as PrismaService;
}
