import {
  Prisma,
  PurchaseInvoiceStatus,
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PurchaseInvoicesRepository } from "../../purchase-invoices/purchase-invoices.repository";
import {
  PurchasePaymentExceedsBalanceError,
  PurchasePaymentInvoiceReferenceError,
  PurchasePaymentStateConflictError,
  PurchasePaymentsRepository,
} from "../purchase-payments.repository";

describe("PurchasePaymentsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const paymentId = "20000000-0000-4000-8000-000000000001";
  const invoiceId = "30000000-0000-4000-8000-000000000001";

  it("creates a workspace-scoped draft payment", async () => {
    const create = jest.fn().mockResolvedValue(payment());
    const repository = new PurchasePaymentsRepository(
      { purchasePayment: { create } } as unknown as PrismaService,
      invoiceRepository(),
    );
    const data = createData();

    await repository.create(data);

    expect(create).toHaveBeenCalledWith({ data });
    expect(data).not.toHaveProperty("status");
  });

  it("updates only a draft payment in a serializable transaction", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([payment()]);
    const transaction = transactionMock({
      purchasePayment: { updateManyAndReturn },
    });
    const repository = createRepository(transaction);

    await repository.update(workspaceId, paymentId, {
      notes: "Updated",
    });

    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: paymentId,
        workspaceId,
        status: PurchasePaymentStatus.DRAFT,
      },
      data: { notes: "Updated" },
    });
    expectSerializable(transaction);
  });

  it("applies invoice, status, method and date filters", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new PurchasePaymentsRepository(
      { purchasePayment: { findMany } } as unknown as PrismaService,
      invoiceRepository(),
    );
    const from = new Date("2026-08-01T00:00:00.000Z");
    const to = new Date("2026-08-31T00:00:00.000Z");

    await repository.findByWorkspace(workspaceId, {
      purchaseInvoiceId: invoiceId,
      status: PurchasePaymentStatus.CONFIRMED,
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      paymentDateFrom: from,
      paymentDateTo: to,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        purchaseInvoiceId: invoiceId,
        status: PurchasePaymentStatus.CONFIRMED,
        paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
        paymentDate: { gte: from, lte: to },
      },
      orderBy: [{ paymentDate: "desc" }, { number: "asc" }],
    });
  });

  it("confirms a partial payment and recalculates paidAmount atomically", async () => {
    const { repository, transaction, invoiceUpdate } =
      confirmationRepository(40, 100);

    const result = await repository.confirm(workspaceId, paymentId);

    expect(result.status).toBe(PurchasePaymentStatus.CONFIRMED);
    expect(invoiceUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      workspaceId,
      invoiceId,
      new Prisma.Decimal(10),
      PurchaseInvoiceStatus.CONFIRMED,
      new Prisma.Decimal(40),
      PurchaseInvoiceStatus.PARTIALLY_PAID,
    );
    expectSerializable(transaction);
  });

  it("marks the invoice paid when the confirmed total equals its total", async () => {
    const { repository, invoiceUpdate } = confirmationRepository(100, 100);

    await repository.confirm(workspaceId, paymentId);

    expect(invoiceUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      workspaceId,
      invoiceId,
      new Prisma.Decimal(10),
      PurchaseInvoiceStatus.CONFIRMED,
      new Prisma.Decimal(100),
      PurchaseInvoiceStatus.PAID,
    );
  });

  it("rejects overpayment before updating the invoice", async () => {
    const { repository, invoiceUpdate } = confirmationRepository(101, 100);

    await expect(
      repository.confirm(workspaceId, paymentId),
    ).rejects.toBeInstanceOf(PurchasePaymentExceedsBalanceError);
    expect(invoiceUpdate).not.toHaveBeenCalled();
  });

  it("rejects a repeated confirmation before touching the invoice", async () => {
    const invoiceFind = jest.fn();
    const transaction = transactionMock({
      purchasePayment: {
        updateManyAndReturn: jest.fn().mockResolvedValue([]),
      },
    });
    const repository = createRepository(
      transaction,
      invoiceRepository({ findPayableInTransaction: invoiceFind }),
    );

    await expect(
      repository.confirm(workspaceId, paymentId),
    ).rejects.toBeInstanceOf(PurchasePaymentStateConflictError);
    expect(invoiceFind).not.toHaveBeenCalled();
  });

  it("rejects a cancelled, paid or currency-mismatched invoice", async () => {
    const transaction = transactionMock({
      purchasePayment: {
        updateManyAndReturn: jest
          .fn()
          .mockResolvedValue([payment(PurchasePaymentStatus.CONFIRMED)]),
      },
    });
    const repository = createRepository(
      transaction,
      invoiceRepository({
        findPayableInTransaction: jest.fn().mockResolvedValue(null),
      }),
    );

    await expect(
      repository.confirm(workspaceId, paymentId),
    ).rejects.toBeInstanceOf(PurchasePaymentInvoiceReferenceError);
  });

  function confirmationRepository(paidTotal: number, invoiceTotal: number) {
    const invoiceUpdate = jest.fn().mockResolvedValue(true);
    const invoiceFind = jest.fn().mockResolvedValue({
      id: invoiceId,
      workspaceId,
      currencyCode: "EUR",
      status: PurchaseInvoiceStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(invoiceTotal),
      paidAmount: new Prisma.Decimal(10),
    });
    const transaction = transactionMock({
      purchasePayment: {
        updateManyAndReturn: jest
          .fn()
          .mockResolvedValue([payment(PurchasePaymentStatus.CONFIRMED)]),
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amount: new Prisma.Decimal(paidTotal) },
        }),
      },
    });

    return {
      repository: createRepository(
        transaction,
        invoiceRepository({
          findPayableInTransaction: invoiceFind,
          updatePaymentStatusInTransaction: invoiceUpdate,
        }),
      ),
      transaction,
      invoiceUpdate,
    };
  }

  function createRepository(
    transaction: jest.Mock,
    purchaseInvoicesRepository = invoiceRepository(),
  ) {
    return new PurchasePaymentsRepository(
      { $transaction: transaction } as unknown as PrismaService,
      purchaseInvoicesRepository,
    );
  }

  function invoiceRepository(overrides: object = {}) {
    return {
      findPayableInTransaction: jest.fn(),
      updatePaymentStatusInTransaction: jest.fn(),
      ...overrides,
    } as unknown as PurchaseInvoicesRepository;
  }

  function transactionMock(client: object) {
    return jest.fn(async (callback: (transaction: object) => unknown) =>
      callback(client),
    );
  }

  function expectSerializable(transaction: jest.Mock) {
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  function createData() {
    return {
      workspaceId,
      number: "PP-001",
      purchaseInvoiceId: invoiceId,
      amount: new Prisma.Decimal(40),
      currencyCode: "EUR",
      paymentMethod: PurchasePaymentMethod.BANK_TRANSFER,
      paymentDate: new Date("2026-08-10T00:00:00.000Z"),
    };
  }

  function payment(
    status: PurchasePaymentStatus = PurchasePaymentStatus.DRAFT,
  ) {
    return {
      id: paymentId,
      ...createData(),
      status,
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
});
