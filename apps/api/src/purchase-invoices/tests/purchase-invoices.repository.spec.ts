import { Prisma, PurchaseInvoiceStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PurchaseInvoiceDuplicateSupplierNumberError,
  PurchaseInvoicesRepository,
} from "../purchase-invoices.repository";

describe("PurchaseInvoicesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const invoiceId = "20000000-0000-4000-8000-000000000001";
  const supplierId = "30000000-0000-4000-8000-000000000001";

  it("creates a draft invoice with server totals in a serializable transaction", async () => {
    const create = jest.fn().mockResolvedValue(invoice());
    const transaction = transactionMock({
      purchaseInvoice: {
        findFirst: jest.fn().mockResolvedValue(null),
        create,
      },
    });
    const repository = createRepository(transaction);

    await repository.create(createData());

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId,
        subtotalAmount: new Prisma.Decimal(20),
        taxAmount: new Prisma.Decimal(4),
        totalAmount: new Prisma.Decimal(24),
        lines: { create: expect.any(Array) },
      }),
      include: { lines: { orderBy: expect.any(Array) } },
    });
    expect(create.mock.calls[0][0].data).not.toHaveProperty("paidAmount");
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("rejects a duplicate supplier invoice number", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      purchaseInvoice: {
        findFirst: jest.fn().mockResolvedValue({ id: invoiceId }),
        create,
      },
    });
    const repository = createRepository(transaction);

    await expect(repository.create(createData())).rejects.toBeInstanceOf(
      PurchaseInvoiceDuplicateSupplierNumberError,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("replaces draft lines and totals atomically", async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const createMany = jest.fn().mockResolvedValue({ count: 1 });
    const transaction = transactionMock({
      purchaseInvoice: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            supplierId,
            supplierInvoiceNumber: "SUP-42",
          })
          .mockResolvedValueOnce(null),
        updateManyAndReturn: jest.fn().mockResolvedValue([{ id: invoiceId }]),
        findUniqueOrThrow: jest.fn().mockResolvedValue(invoice()),
      },
      purchaseInvoiceLine: { deleteMany, createMany },
    });
    const repository = createRepository(transaction);
    const line = createData().lines[0];

    await repository.update(workspaceId, invoiceId, { lines: [line] });

    expect(deleteMany).toHaveBeenCalledWith({
      where: { workspaceId, purchaseInvoiceId: invoiceId },
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [{ ...line, purchaseInvoiceId: invoiceId }],
    });
  });

  it("applies workspace, supplier, status and date filters", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new PurchaseInvoicesRepository({
      purchaseInvoice: { findMany },
    } as unknown as PrismaService);
    const from = new Date("2026-08-01T00:00:00.000Z");
    const to = new Date("2026-08-31T23:59:59.000Z");

    await repository.findByWorkspace(workspaceId, {
      supplierId,
      status: PurchaseInvoiceStatus.CONFIRMED,
      invoiceDateFrom: from,
      invoiceDateTo: to,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        supplierId,
        status: PurchaseInvoiceStatus.CONFIRMED,
        invoiceDate: { gte: from, lte: to },
      },
      orderBy: [{ invoiceDate: "desc" }, { number: "asc" }],
    });
  });

  it("confirms a non-empty draft atomically and stamps confirmedAt", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([{ id: invoiceId }]);
    const transaction = transactionMock({
      purchaseInvoice: {
        updateManyAndReturn,
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(invoice(PurchaseInvoiceStatus.CONFIRMED)),
      },
    });
    const repository = createRepository(transaction);

    const result = await repository.confirm(workspaceId, invoiceId);

    expect(result?.status).toBe(PurchaseInvoiceStatus.CONFIRMED);
    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: invoiceId,
        workspaceId,
        status: { in: [PurchaseInvoiceStatus.DRAFT] },
        lines: { some: {} },
      },
      data: {
        status: PurchaseInvoiceStatus.CONFIRMED,
        confirmedAt: expect.any(Date),
      },
      select: { id: true },
    });
  });

  it("loads only a payable invoice through the payment transaction contract", async () => {
    const findFirst = jest.fn().mockResolvedValue(invoice());
    const transaction = {
      purchaseInvoice: { findFirst },
    } as unknown as Prisma.TransactionClient;
    const repository = new PurchaseInvoicesRepository({} as PrismaService);

    await repository.findPayableInTransaction(
      transaction,
      workspaceId,
      invoiceId,
      "EUR",
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: invoiceId,
        workspaceId,
        currencyCode: "EUR",
        status: {
          in: [
            PurchaseInvoiceStatus.CONFIRMED,
            PurchaseInvoiceStatus.PARTIALLY_PAID,
          ],
        },
      },
    });
  });

  it("updates paidAmount through an optimistic transaction contract", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([{ id: invoiceId }]);
    const transaction = {
      purchaseInvoice: { updateManyAndReturn },
    } as unknown as Prisma.TransactionClient;
    const repository = new PurchaseInvoicesRepository({} as PrismaService);
    const previousPaidAmount = new Prisma.Decimal(10);
    const paidAmount = new Prisma.Decimal(24);

    const updated = await repository.updatePaymentStatusInTransaction(
      transaction,
      workspaceId,
      invoiceId,
      previousPaidAmount,
      PurchaseInvoiceStatus.PARTIALLY_PAID,
      paidAmount,
      PurchaseInvoiceStatus.PAID,
    );

    expect(updated).toBe(true);
    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: invoiceId,
        workspaceId,
        paidAmount: previousPaidAmount,
        status: PurchaseInvoiceStatus.PARTIALLY_PAID,
      },
      data: { paidAmount, status: PurchaseInvoiceStatus.PAID },
      select: { id: true },
    });
  });

  function createRepository(transaction: jest.Mock) {
    return new PurchaseInvoicesRepository({
      $transaction: transaction,
    } as unknown as PrismaService);
  }

  function transactionMock(client: object) {
    return jest.fn(async (callback: (transaction: object) => unknown) =>
      callback(client),
    );
  }

  function createData() {
    return {
      workspaceId,
      number: "PI-001",
      supplierInvoiceNumber: "SUP-42",
      supplierId,
      currencyCode: "EUR",
      invoiceDate: new Date("2026-08-09T00:00:00.000Z"),
      lines: [
        {
          workspaceId,
          description: "Components",
          quantity: new Prisma.Decimal(2),
          unitPrice: new Prisma.Decimal(10),
          taxRate: new Prisma.Decimal(20),
          subtotalAmount: new Prisma.Decimal(20),
          taxAmount: new Prisma.Decimal(4),
          totalAmount: new Prisma.Decimal(24),
        },
      ],
    };
  }

  function invoice(
    status: PurchaseInvoiceStatus = PurchaseInvoiceStatus.DRAFT,
  ) {
    return {
      id: invoiceId,
      workspaceId,
      number: "PI-001",
      supplierInvoiceNumber: "SUP-42",
      supplierId,
      purchaseOrderId: null,
      currencyCode: "EUR",
      status,
      invoiceDate: new Date("2026-08-09T00:00:00.000Z"),
      dueDate: null,
      subtotalAmount: new Prisma.Decimal(20),
      taxAmount: new Prisma.Decimal(4),
      totalAmount: new Prisma.Decimal(24),
      paidAmount: new Prisma.Decimal(0),
      notes: null,
      confirmedAt:
        status === PurchaseInvoiceStatus.CONFIRMED
          ? new Date("2026-08-09T01:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      lines: [],
    };
  }
});
